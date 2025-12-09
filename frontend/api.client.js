// frontend/api.client.js

// ==========================================
// 1. CONFIGURATION & OFFLINE STATE
// ==========================================

const API_BASE_URL = "https://mining-project.onrender.com";

let isOnline = navigator.onLine;
let offlineQueue = [];
let syncInProgress = false;

// Monitor online/offline status
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

function handleOnline() {
  isOnline = true;
  console.log('[Offline] Back online, syncing queued requests...');
  document.dispatchEvent(new CustomEvent('connection-status-changed', { detail: { online: true } }));
  syncOfflineQueue();
}

function handleOffline() {
  isOnline = false;
  console.log('[Offline] Network connection lost');
  document.dispatchEvent(new CustomEvent('connection-status-changed', { detail: { online: false } }));
}

// Service Worker message handler
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SYNC_OFFLINE_QUEUE') {
      syncOfflineQueue();
    }
  });
}

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

// Helper: Hashing for secure local password verification
async function simpleHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: Store credentials locally for offline access
function storeOfflineCredentials(email, password, userData, token) {
  simpleHash(password).then(passwordHash => {
    try {
      const offlineAuth = {
        email: email.toLowerCase(),
        passwordHash: passwordHash,
        userData: userData,
        token: token,
        lastSync: Date.now()
      };
      localStorage.setItem('offlineAuth', JSON.stringify(offlineAuth));
      console.log('[Offline Auth] Credentials cached for offline login');
    } catch (e) {
      console.error('[Offline Auth] Failed to cache credentials:', e);
    }
  });
}

// Helper: Fetch with retry logic
const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.log(`Fetch attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

// --- CORE API REQUEST HANDLER ---
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  let headers = { ...options.headers };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { headers: headers, ...options };
  if (Object.keys(config.headers).length === 0) delete config.headers;

  // CRITICAL FIX: Explicitly list endpoints that MUST NOT be queued
  // These endpoints require an immediate server response.
  const noQueueEndpoints = [
    '/api/v1/user/login',
    '/api/v1/user/register',
    '/api/v1/user/logout',
    '/api/v1/user/refresh-token',
    '/api/v1/user/current-user',
    '/api/v1/push/public-key'
  ];

  const shouldNotQueue = noQueueEndpoints.some(path => endpoint.includes(path));

  // A. IF OFFLINE & SAFE TO QUEUE -> Queue it
  // (e.g. Hazard reports, attendance, checklists)
  if (!isOnline && options.method !== 'GET' && !shouldNotQueue) {
    console.log('[Offline] Queueing request:', endpoint);
    return await queueOfflineRequest(endpoint, config);
  }

  // B. IF OFFLINE & CRITICAL (e.g. Login) -> DO NOT QUEUE. 
  // Return a special error object so authAPI can detect it and run fallback logic.
  if (!isOnline && shouldNotQueue) {
    return { error: true, offline: true, message: "Offline mode prevented request" };
  }

  // C. ONLINE -> Proceed normally
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, config);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Optional: window.location.href = '/login.html';
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    // Cache successful GET responses for offline use
    if (options.method === 'GET' && typeof offlineDB !== 'undefined') {
      try { await offlineDB.cacheResponse(endpoint, data, 3600000); }
      catch (e) { console.warn('[Cache] Failed to cache response:', e); }
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);

    // Try to serve cached GET data if network fails
    if (options.method === 'GET' && typeof offlineDB !== 'undefined') {
      try {
        const cached = await offlineDB.getCachedResponse(endpoint);
        if (cached) {
          console.log('[Offline] Using cached response for:', endpoint);
          return { ...cached, _fromCache: true };
        }
      } catch (e) { console.warn('[Cache] Failed to get cached response:', e); }
    }

    throw error;
  }
};

// ==========================================
// 3. OFFLINE QUEUE MANAGEMENT
// ==========================================

async function queueOfflineRequest(endpoint, config) {
  const requestData = {
    endpoint,
    method: config.method || 'POST',
    body: config.body,
    headers: config.headers,
    timestamp: Date.now()
  };

  offlineQueue.push(requestData);

  if (typeof offlineDB !== 'undefined') {
    try { await offlineDB.queueRequest(endpoint, config.method || 'POST', config.body, config.headers); }
    catch (e) { console.error('[Offline] Failed to queue in IndexedDB:', e); }
  }

  document.dispatchEvent(new CustomEvent('request-queued', { detail: { endpoint, method: config.method } }));

  return {
    success: true,
    message: 'Request queued for sync when online',
    offline: true,
    queued: true
  };
}

async function syncOfflineQueue() {
  if (syncInProgress || !isOnline) return;

  syncInProgress = true;
  console.log('[Offline] Starting sync...');

  if (typeof offlineDB !== 'undefined') {
    try {
      const dbQueue = await offlineDB.getQueuedRequests();
      // Merge unique items from DB into memory queue
      offlineQueue = [...offlineQueue, ...dbQueue.filter(dbItem =>
        !offlineQueue.some(memItem => memItem.timestamp === dbItem.timestamp)
      )];
    } catch (e) { console.error('[Offline] Failed to load queue from IndexedDB:', e); }
  }

  const queue = [...offlineQueue];
  offlineQueue = [];

  let successCount = 0;
  let failCount = 0;

  for (const request of queue) {
    try {
      const response = await fetch(`${API_BASE_URL}${request.endpoint}`, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });

      if (response.ok) {
        successCount++;
        if (typeof offlineDB !== 'undefined' && request.id) {
          await offlineDB.delete('offlineQueue', request.id);
        }
      } else {
        failCount++;
        offlineQueue.push(request); // Re-queue failed request
      }
    } catch (error) {
      failCount++;
      offlineQueue.push(request);
    }
  }

  syncInProgress = false;

  document.dispatchEvent(new CustomEvent('sync-completed', {
    detail: { successCount, failCount, remaining: offlineQueue.length }
  }));
}

function getOfflineQueueStatus() {
  return { isOnline, queueLength: offlineQueue.length, syncInProgress };
}

async function clearOfflineQueue() {
  offlineQueue = [];
  if (typeof offlineDB !== 'undefined') {
    try { await offlineDB.clear('offlineQueue'); }
    catch (e) { console.error('[Offline] Failed to clear queue:', e); }
  }
}

// ==========================================
// 4. API MODULES (ROBUST AUTH)
// ==========================================

const authAPI = {
  // Robust Login that handles "Fake Online" states
  login: async (credentials) => {
    const { email, password } = credentials;

    // 1. Try Online Login first if we think we are online
    if (isOnline) {
      try {
        const response = await apiRequest("/api/v1/user/login", {
          method: "POST",
          body: JSON.stringify(credentials),
        });

        // CRITICAL CHECK: If response implies it failed due to network/offline logic
        // (e.g. error flag returned because of noQueueEndpoints logic)
        if (response.queued || response.error || !response.data) {
          console.warn("[Auth] Online login failed/blocked. Trying offline fallback...");
          return await authAPI.handleOfflineLogin(email, password);
        }

        // SUCCESS ONLINE: Cache credentials for future use
        if (response.success && response.data) {
          storeOfflineCredentials(email, password, response.data.user, response.data.accessToken);
        }
        return response;

      } catch (error) {
        // Network failed mid-request? Fallback.
        console.warn("[Auth] Network error during login. Trying offline fallback...", error);
        return await authAPI.handleOfflineLogin(email, password);
      }
    }

    // 2. We know we are Offline -> Go directly to local auth
    else {
      return await authAPI.handleOfflineLogin(email, password);
    }
  },

  // Extracted Offline Verification Logic
  handleOfflineLogin: async (email, password) => {
    console.log("[Auth] Attempting local verification...");
    const cachedData = localStorage.getItem('offlineAuth');

    if (!cachedData) {
      throw new Error("No offline login data available. Please connect to internet and login at least once.");
    }

    const offlineAuth = JSON.parse(cachedData);

    if (email.toLowerCase() !== offlineAuth.email) {
      throw new Error("Invalid credentials (Offline Mode)");
    }

    const inputHash = await simpleHash(password);
    if (inputHash !== offlineAuth.passwordHash) {
      throw new Error("Invalid credentials (Offline Mode)");
    }

    // Return a mock response structure matching the real API
    return {
      success: true,
      message: "Logged in via Offline Mode",
      data: {
        user: offlineAuth.userData,
        accessToken: offlineAuth.token
      },
      offline: true
    };
  },

  register: (data) => apiRequest("/api/v1/user/register", { method: "POST", body: JSON.stringify(data) }),

  logout: () => {
    localStorage.removeItem('offlineAuth');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return apiRequest("/api/v1/user/logout", { method: "POST" });
  },

  getCurrentUser: async () => {
    if (isOnline) {
      try {
        const res = await apiRequest("/api/v1/user/current-user", { method: "GET" });
        localStorage.setItem('user', JSON.stringify(res.data));
        return res;
      } catch (e) { console.warn("Online fetch failed, falling back to local data"); }
    }
    const localUser = localStorage.getItem('user');
    if (localUser) return { success: true, data: JSON.parse(localUser), offline: true };
    throw new Error("No user data found");
  },

  updateAccount: (data) => apiRequest("/api/v1/user/update-account", { method: "PATCH", body: JSON.stringify(data) }),
  changePassword: (data) => apiRequest("/api/v1/user/change-password", { method: "POST", body: JSON.stringify(data) }),
};

// --- USER MANAGEMENT API ---
const userManagementAPI = {
  create: (data) => apiRequest("/api/v1/user", { method: "POST", body: JSON.stringify(data) }),
  getAll: (page = 1, limit = 10) => apiRequest(`/api/v1/user?page=${page}&limit=${limit}`, { method: "GET" }),
  getById: (id) => apiRequest(`/api/v1/user/${id}`, { method: "GET" }),
  update: (id, data) => apiRequest(`/api/v1/user/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/v1/user/${id}`, { method: "DELETE" }),
};

// --- TASK API ---
const taskAPI = {
  create: (data) => apiRequest("/api/v1/tasks", { method: "POST", body: JSON.stringify(data) }),
  getAll: (page = 1, limit = 10) => apiRequest(`/api/v1/tasks?page=${page}&limit=${limit}`, { method: "GET" }),
  getById: (id) => apiRequest(`/api/v1/tasks/${id}`, { method: "GET" }),
  update: (id, data) => apiRequest(`/api/v1/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/v1/tasks/${id}`, { method: "DELETE" }),
};

// --- ASSIGNMENT API ---
const userTaskAssignmentAPI = {
  assign: (data) => apiRequest("/api/v1/assignments", { method: "POST", body: JSON.stringify(data) }),
  getForUser: (userId) => apiRequest(`/api/v1/assignments/${userId}`, { method: "GET" }),
  update: (id, data) => apiRequest(`/api/v1/assignments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/v1/assignments/${id}`, { method: "DELETE" }),
};

// --- ATTENDANCE API ---
const attendanceAPI = {
  clockIn: (data) => apiRequest("/api/v1/attendance/check-in", { method: "POST", body: JSON.stringify(data) }),
  clockOut: (data) => apiRequest("/api/v1/attendance/check-out", { method: "POST", body: JSON.stringify(data) }),
  getForUser: (userId, startDate, endDate) => {
    const query = startDate && endDate ? `?start=${startDate}&end=${endDate}` : "";
    return apiRequest(`/api/v1/attendance/user/${userId}${query}`, { method: "GET" });
  },
};

// --- CHECKLIST API ---
const checklistAPI = {
  create: (data) => apiRequest("/api/v1/checklists", { method: "POST", body: JSON.stringify(data) }),
  getAll: (roleId, taskId, page = 1, limit = 10) => {
    const query = `?page=${page}&limit=${limit}`;
    const roleTaskQuery = roleId || taskId ? `&role_id=${roleId || ""}&task_id=${taskId || ""}` : "";
    return apiRequest(`/api/v1/checklists${query}${roleTaskQuery}`, { method: "GET" });
  },
  getById: (id) => apiRequest(`/api/v1/checklists/${id}`, { method: "GET" }),
  update: (id, data) => apiRequest(`/api/v1/checklists/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/v1/checklists/${id}`, { method: "DELETE" }),
};

// --- CHECKLIST ITEM API ---
const checklistItemAPI = {
  create: (data) => apiRequest("/api/v1/checklist-items", { method: "POST", body: JSON.stringify(data) }),
  getByChecklist: (checklistId) => apiRequest(`/api/v1/checklist-items?checklist_id=${checklistId}`, { method: "GET" }),
  getById: (id) => apiRequest(`/api/v1/checklist-items/${id}`, { method: "GET" }),
  update: (id, data) => apiRequest(`/api/v1/checklist-items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/v1/checklist-items/${id}`, { method: "DELETE" }),
};

// --- MEDIA UPLOAD APIs ---
const checklistItemMediaAPI = {
  upload: (formData) => apiRequest("/api/v1/checklist-item-media/upload", { method: "POST", body: formData }),
  getAll: () => apiRequest("/api/v1/checklist-item-media", { method: "GET" }),
};

const hazardMediaAPI = {
  upload: (formData) => apiRequest("/api/v1/hazard-media/upload", { method: "POST", body: formData }),
  getAll: () => apiRequest("/api/v1/hazard-media", { method: "GET" }),
  getById: (id) => apiRequest(`/api/v1/hazard-media/${id}`, { method: "GET" }),
};

const safetyVideoAPI = {
  upload: (formData) => apiRequest("/api/v1/safety-videos/upload", { method: "POST", body: formData }),
  getAll: () => apiRequest("/api/v1/safety-videos", { method: "GET" }),
  update: (id, data) => apiRequest(`/api/v1/safety-videos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/v1/safety-videos/${id}`, { method: "DELETE" }),
};

// --- ADDITIONAL MODULES ---
const dailyVideoAPI = {
  assign: (data) => apiRequest("/api/v1/daily-videos", { method: "POST", body: JSON.stringify(data) }),
  getForUser: (userId) => apiRequest(`/api/v1/daily-videos/${userId}`, { method: "GET" }),
  markWatched: (id, watched, watchedDate) => apiRequest(`/api/v1/daily-videos/${id}`, { method: "PUT", body: JSON.stringify({ watched, watched_date: watchedDate }) }),
};

const hazardReportAPI = {
  create: (data) => apiRequest("/api/v1/hazard-reports", { method: "POST", body: JSON.stringify(data) }),
  getAll: () => apiRequest("/api/v1/hazard-reports", { method: "GET" }),
  getById: (id) => apiRequest(`/api/v1/hazard-reports/${id}`, { method: "GET" }),
  update: (id, data) => apiRequest(`/api/v1/hazard-reports/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/v1/hazard-reports/${id}`, { method: "DELETE" }),
};

const notificationAPI = {
  create: (data) => apiRequest("/api/v1/notifications", { method: "POST", body: JSON.stringify(data) }),
  getForUser: (userId) => apiRequest(`/api/v1/notifications/user/${userId}`, { method: "GET" }),
  markAsRead: (id) => apiRequest(`/api/v1/notifications/${id}/read`, { method: "PUT", body: JSON.stringify({ read_at: new Date() }) }),
};

const payrollAPI = {
  createOrUpdate: (data) => apiRequest("/api/v1/payroll", { method: "POST", body: JSON.stringify(data) }),
  getForUser: (userId) => apiRequest(`/api/v1/payroll/user/${userId}`, { method: "GET" }),
};

const roleAPI = {
  create: (data) =>
    apiRequest("/api/v1/roles", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  getAll: (page = 1, limit = 100) =>
    apiRequest(`/api/v1/roles?page=${page}&limit=${limit}`, {
      method: "GET"
    }),
  getById: (id) =>
    apiRequest(`/api/v1/roles/${id}`, {
      method: "GET"
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
  delete: (id) =>
    apiRequest(`/api/v1/roles/${id}`, {
      method: "DELETE"
    }),
};

const hazardCategoryAPI = {
  create: (data) =>
    apiRequest("/api/v1/hazard-categories", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  getAll: () =>
    apiRequest("/api/v1/hazard-categories", {
      method: "GET"
    }),
  getById: (id) =>
    apiRequest(`/api/v1/hazard-categories/${id}`, {
      method: "GET"
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/hazard-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
  delete: (id) =>
    apiRequest(`/api/v1/hazard-categories/${id}`, {
      method: "DELETE"
    })
};

const severityTagAPI = {
  getAll: () => apiRequest("/api/v1/severity-tags", { method: "GET" }),
};

// Placeholder modules to complete the export list
const escalationAPI = { create: (data) => apiRequest("/api/v1/escalations", { method: "POST", body: JSON.stringify(data) }) };
const integrationAPI = { getAll: () => apiRequest("/api/v1/external-integrations", { method: "GET" }) };
const followUpAPI = { create: (data) => apiRequest("/api/v1/follow-up-actions", { method: "POST", body: JSON.stringify(data) }) };
const hazardAssignmentAPI = {
  create: (data) => apiRequest("/api/v1/hazard-assignments", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  getByReport: (reportId) => apiRequest(`/api/v1/hazard-assignments/report/${reportId}`, { method: "GET" }),
};
const hazardAuditAPI = { create: (data) => apiRequest("/api/v1/hazard-audits", { method: "POST", body: JSON.stringify(data) }) };
const safetyPromptAPI = { schedule: (data) => apiRequest("/api/v1/safety-prompts", { method: "POST", body: JSON.stringify(data) }) };

// 5. Worker Video API
const workerVideoAPI = {
  // Worker: Upload Video
  // Note: 'data' should be a FormData object containing the file and other fields
  upload: (formData) =>
    apiRequest("/api/v1/worker-videos/upload", {
      method: "POST",
      body: formData,
      // Important: When sending FormData, do NOT set Content-Type header manually.
      // The browser/fetch will set it automatically with the boundary.
      // Ensure your apiRequest function doesn't force 'application/json' if body is FormData.
    }),

  // Worker: Get logged-in user's videos
  getMyVideos: (page = 1, limit = 10) =>
    apiRequest(`/api/v1/worker-videos/my-videos?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  // Public/Shared: Get list of approved videos
  getApproved: (page = 1, limit = 10, search = "") =>
    apiRequest(
      `/api/v1/worker-videos/approved?page=${page}&limit=${limit}&search=${encodeURIComponent(
        search
      )}`,
      {
        method: "GET",
      }
    ),

  // Public/Shared: Get specific video details
  getById: (id) =>
    apiRequest(`/api/v1/worker-videos/${id}`, {
      method: "GET",
    }),

  // Admin: Get videos pending approval
  getPending: (page = 1, limit = 10) =>
    apiRequest(`/api/v1/worker-videos/pending?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  // Admin: Get all videos (with filters)
  getAll: (page = 1, limit = 10, status = "") => {
    let url = `/api/v1/worker-videos/all?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return apiRequest(url, { method: "GET" });
  },

  // Admin: Approve a video
  approve: (id) =>
    apiRequest(`/api/v1/worker-videos/${id}/approve`, {
      method: "POST",
    }),

  // Admin: Reject a video
  reject: (id, rejectionReason) =>
    apiRequest(`/api/v1/worker-videos/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejectionReason }),
    }),

  // Admin: Moderation - Get Auto-Rejected videos
  getAutoRejected: (page = 1, limit = 10) =>
    apiRequest(
      `/api/v1/worker-videos/moderation/auto-rejected?page=${page}&limit=${limit}`,
      {
        method: "GET",
      }
    ),

  // Admin: Moderation - Get Flagged videos
  getFlagged: (page = 1, limit = 10) =>
    apiRequest(
      `/api/v1/worker-videos/moderation/flagged?page=${page}&limit=${limit}`,
      {
        method: "GET",
      }
    ),

  // Admin: Moderation - Get Statistics
  getModerationStats: () =>
    apiRequest("/api/v1/worker-videos/moderation/stats", {
      method: "GET",
    }),

  // Management: Update video details (title/description)
  update: (id, data) =>
    apiRequest(`/api/v1/worker-videos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Management: Delete video
  delete: (id) =>
    apiRequest(`/api/v1/worker-videos/${id}`, {
      method: "DELETE",
    }),
};

// ==========================================
// 5. EXPORTS
// ==========================================

window.authAPI = authAPI;
window.userManagementAPI = userManagementAPI;
window.taskAPI = taskAPI;
window.userTaskAssignmentAPI = userTaskAssignmentAPI;
window.attendanceAPI = attendanceAPI;
window.checklistAPI = checklistAPI;
window.checklistItemAPI = checklistItemAPI;
window.checklistItemMediaAPI = checklistItemMediaAPI;
window.hazardReportAPI = hazardReportAPI;
window.hazardMediaAPI = hazardMediaAPI;
window.hazardCategoryAPI = hazardCategoryAPI;
window.severityTagAPI = severityTagAPI;
window.dailyVideoAPI = dailyVideoAPI;
window.notificationAPI = notificationAPI;
window.payrollAPI = payrollAPI;
window.roleAPI = roleAPI;
window.safetyVideoAPI = safetyVideoAPI;
window.escalationAPI = escalationAPI;
window.integrationAPI = integrationAPI;
window.followUpAPI = followUpAPI;
window.hazardAssignmentAPI = hazardAssignmentAPI;
window.hazardAuditAPI = hazardAuditAPI;
window.safetyPromptAPI = safetyPromptAPI;
window.workerVideoAPI = workerVideoAPI;

// Export offline utilities
window.getOfflineQueueStatus = getOfflineQueueStatus;
window.syncOfflineQueue = syncOfflineQueue;
window.clearOfflineQueue = clearOfflineQueue;
window.isAppOnline = () => isOnline;

console.log("API client loaded with robust offline-first authentication.");