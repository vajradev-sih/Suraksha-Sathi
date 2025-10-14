// API Configuration
const API_BASE_URL = "http://localhost:3000"; // Change to your actual API base URL

// --- Utility Functions ---

// Helper function with retry logic
const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.log(`Fetch attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
};

// Helper function for making API requests with authentication and file/JSON handling
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  // Start with user-provided headers
  let headers = {
    ...options.headers,
  };

  // Only set Content-Type: application/json if it's NOT a file upload (FormData)
  // AND if the user hasn't explicitly set another Content-Type.
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    headers: headers,
    ...options,
  };

  // Remove headers property from config if it's empty to prevent fetch errors
  if (Object.keys(config.headers).length === 0) {
    delete config.headers;
  }

  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, config);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      // If unauthorized, clear token and redirect to login
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // You might need to change the redirect path to your actual login page
        // window.location.href = '/login.html';
        // return;
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// --- API Client Objects ---

// 1. User Authentication and Self-Management API
// Based on user.controller.js logic (register, login, etc.)
const authAPI = {
  // Auth endpoints are often simpler paths like /register, /login
  register: (data) =>
    apiRequest("/api/v1/user/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data) =>
    apiRequest("/api/v1/user/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  logout: () =>
    apiRequest("/api/v1/user/logout", {
      method: "POST",
    }),
  getCurrentUser: () =>
    apiRequest("/api/v1/user/current-user", {
      // Assumed path from controller logic
      method: "GET",
    }),
  updateAccount: (data) =>
    apiRequest("/api/v1/user/update-account", {
      // Assumed path
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  changePassword: (data) =>
    apiRequest("/api/v1/user/change-password", {
      // Assumed path
      method: "POST",
      body: JSON.stringify(data),
    }),
  // Placeholder methods for completeness based on controller logic
  getWatchHistory: (userId) =>
    apiRequest(`/api/v1/user/watch-history/${userId}`, {
      method: "GET",
    }),
  getPublicUserInfo: (userId) =>
    apiRequest(`/api/v1/user/public/${userId}`, {
      method: "GET",
    }),
};

// 2. User Management API (Admin/Manager CRUD)
const userManagementAPI = {
  create: (data) =>
    apiRequest("/api/v1/user", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: (page = 1, limit = 10) =>
    apiRequest(`/api/v1/user?page=${page}&limit=${limit}`, {
      method: "GET",
    }),
  getById: (id) =>
    apiRequest(`/api/v1/user/${id}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/user/${id}`, {
      method: "DELETE",
    }),
};

// 3. Task API
const taskAPI = {
  create: (data) =>
    apiRequest("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: (page = 1, limit = 10) =>
    apiRequest(`/api/v1/tasks?page=${page}&limit=${limit}`, {
      method: "GET",
    }),
  getById: (id) =>
    apiRequest(`/api/v1/tasks/${id}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/tasks/${id}`, {
      method: "DELETE",
    }),
};

// 4. User Task Assignment API
const userTaskAssignmentAPI = {
  assign: (data) =>
    apiRequest("/api/v1/user-tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getForUser: (userId) =>
    apiRequest(`/api/v1/user-tasks/${userId}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/user-tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/user-tasks/${id}`, {
      method: "DELETE",
    }),
};

// 5. Attendance API
const attendanceAPI = {
  clockIn: (data) =>
    apiRequest("/api/v1/attendance/check-in", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  clockOut: (data) =>
    apiRequest("/api/v1/attendance/check-out", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getForUser: (userId, startDate, endDate) => {
    const query =
      startDate && endDate ? `?start=${startDate}&end=${endDate}` : "";
    return apiRequest(`/api/v1/attendance/user/${userId}${query}`, {
      method: "GET",
    });
  },
};

// 6. Checklist API
const checklistAPI = {
  create: (data) =>
    apiRequest("/api/v1/checklists", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: (roleId, taskId, page = 1, limit = 10) => {
    const query = `?page=${page}&limit=${limit}`;
    const roleTaskQuery =
      roleId || taskId
        ? `&role_id=${roleId || ""}&task_id=${taskId || ""}`
        : "";
    return apiRequest(`/api/v1/checklists${query}${roleTaskQuery}`, {
      method: "GET",
    });
  },
  getById: (id) =>
    apiRequest(`/api/v1/checklists/${id}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/checklists/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/checklists/${id}`, {
      method: "DELETE",
    }),
};

// 7. Checklist Item API
const checklistItemAPI = {
  create: (data) =>
    apiRequest("/api/v1/checklist-items", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getByChecklist: (checklistId) =>
    apiRequest(`/api/v1/checklist-items?checklist_id=${checklistId}`, {
      method: "GET",
    }),
  getById: (id) =>
    apiRequest(`/api/v1/checklist-items/${id}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/checklist-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/checklist-items/${id}`, {
      method: "DELETE",
    }),
};

// 8. Checklist Item Media API (File Upload)
const checklistItemMediaAPI = {
  upload: (formData) =>
    apiRequest("/api/v1/checklist-item-media/upload", {
      method: "POST",
      body: formData,
    }),
  getAll: () =>
    apiRequest("/api/v1/checklist-item-media", {
      method: "GET",
    }),
  getById: (id) =>
    apiRequest(`/api/v1/checklist-item-media/${id}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/checklist-item-media/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/checklist-item-media/${id}`, {
      method: "DELETE",
    }),
};

// 9. Daily Video API
const dailyVideoAPI = {
  assign: (data) =>
    apiRequest("/api/v1/daily-videos", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getForUser: (userId) =>
    apiRequest(`/api/v1/daily-videos/${userId}`, {
      method: "GET",
    }),
  markWatched: (id, watched, watchedDate) =>
    apiRequest(`/api/v1/daily-videos/${id}`, {
      method: "PUT",
      body: JSON.stringify({ watched, watched_date: watchedDate }),
    }),
};

// 10. Escalation API
const escalationAPI = {
  create: (data) =>
    apiRequest("/api/v1/escalations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getByReport: (reportId) =>
    apiRequest(`/api/v1/escalations/report/${reportId}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/escalations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/escalations/${id}`, {
      method: "DELETE",
    }),
};

// 11. External Integration API
const integrationAPI = {
  create: (data) =>
    apiRequest("/api/v1/external-integrations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: () =>
    apiRequest("/api/v1/external-integrations", {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/external-integrations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/external-integrations/${id}`, {
      method: "DELETE",
    }),
};

// 12. Follow Up Action API
const followUpAPI = {
  create: (data) =>
    apiRequest("/api/v1/follow-up-actions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getByReport: (reportId) =>
    apiRequest(`/api/v1/follow-up-actions/report/${reportId}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/follow-up-actions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/follow-up-actions/${id}`, {
      method: "DELETE",
    }),
};

// 13. Hazard Assignment API
const hazardAssignmentAPI = {
  create: (data) =>
    apiRequest("/api/v1/hazard-assignments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getByReport: (reportId) =>
    apiRequest(`/api/v1/hazard-assignments/report/${reportId}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/hazard-assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/hazard-assignments/${id}`, {
      method: "DELETE",
    }),
};

// 14. Hazard Audit API
const hazardAuditAPI = {
  create: (data) =>
    apiRequest("/api/v1/hazard-audits", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getByReport: (reportId) =>
    apiRequest(`/api/v1/hazard-audits/report/${reportId}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/hazard-audits/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/hazard-audits/${id}`, {
      method: "DELETE",
    }),
};

// 15. Hazard Category API
const hazardCategoryAPI = {
  create: (data) =>
    apiRequest("/api/v1/hazard-categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: () =>
    apiRequest("/api/v1/hazard-categories", {
      method: "GET",
    }),
  getById: (id) =>
    apiRequest(`/api/v1/hazard-categories/${id}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/hazard-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/hazard-categories/${id}`, {
      method: "DELETE",
    }),
};

// 16. Hazard Media API (File Upload)
const hazardMediaAPI = {
  upload: (formData) =>
    apiRequest("/api/v1/hazard-media/upload", {
      method: "POST",
      body: formData,
    }),
  getAll: () =>
    apiRequest("/api/v1/hazard-media", {
      method: "GET",
    }),
  getById: (id) =>
    apiRequest(`/api/v1/hazard-media/${id}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/hazard-media/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/hazard-media/${id}`, {
      method: "DELETE",
    }),
};

// 17. Hazard Report API
const hazardReportAPI = {
  create: (data) =>
    apiRequest("/api/v1/hazard-reports", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: () =>
    apiRequest("/api/v1/hazard-reports", {
      method: "GET",
    }),
  getById: (id) =>
    apiRequest(`/api/v1/hazard-reports/${id}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/hazard-reports/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/hazard-reports/${id}`, {
      method: "DELETE",
    }),
};

// 18. Notification API
const notificationAPI = {
  create: (data) =>
    apiRequest("/api/v1/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getForUser: (userId) =>
    apiRequest(`/api/v1/notifications/user/${userId}`, {
      method: "GET",
    }),
  markAsRead: (id) =>
    apiRequest(`/api/v1/notifications/${id}/read`, {
      method: "PUT",
      body: JSON.stringify({ read_at: new Date() }), // Controller uses a full body, but endpoint only needs PUT
    }),
};

// 19. Payroll API
const payrollAPI = {
  createOrUpdate: (data) =>
    apiRequest("/api/v1/payroll", {
      // Assuming /api/v1/payroll is base
      method: "POST",
      body: JSON.stringify(data),
    }),
  getForUser: (userId) =>
    apiRequest(`/api/v1/payroll/user/${userId}`, {
      method: "GET",
    }),
};

// 20. Role API
const roleAPI = {
  create: (data) =>
    apiRequest("/api/v1/roles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: (page = 1, limit = 10) =>
    apiRequest(`/api/v1/roles?page=${page}&limit=${limit}`, {
      method: "GET",
    }),
  getById: (id) =>
    apiRequest(`/api/v1/roles/${id}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/roles/${id}`, {
      method: "DELETE",
    }),
};

// 21. Safety Prompt API
const safetyPromptAPI = {
  schedule: (data) =>
    apiRequest("/api/v1/safety-prompts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getForUser: (userId) =>
    apiRequest(`/api/v1/safety-prompts/${userId}`, {
      method: "GET",
    }),
  updateStatus: (id, status) =>
    apiRequest(`/api/v1/safety-prompts/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// 22. Safety Video API (File Upload)
const safetyVideoAPI = {
  upload: (formData) =>
    apiRequest("/api/v1/safety-videos/upload", {
      method: "POST",
      body: formData,
    }),
  getAll: () =>
    apiRequest("/api/v1/safety-videos", {
      method: "GET",
    }),
  getById: (id) =>
    apiRequest(`/api/v1/safety-videos/${id}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/safety-videos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/safety-videos/${id}`, {
      method: "DELETE",
    }),
};

// 23. Severity Tag API
const severityTagAPI = {
  create: (data) =>
    apiRequest("/api/v1/severity-tags", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: () =>
    apiRequest("/api/v1/severity-tags", {
      method: "GET",
    }),
  getById: (id) =>
    apiRequest(`/api/v1/severity-tags/${id}`, {
      method: "GET",
    }),
  update: (id, data) =>
    apiRequest(`/api/v1/severity-tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/api/v1/severity-tags/${id}`, {
      method: "DELETE",
    }),
};

// 24. Placeholder APIs for future modules

// --- Global Export ---

// Re-export original and new APIs
window.authAPI = authAPI;
window.userManagementAPI = userManagementAPI; // NEW: For Admin/Manager CRUD

// Export all new modules
window.taskAPI = taskAPI;
window.userTaskAssignmentAPI = userTaskAssignmentAPI;
window.attendanceAPI = attendanceAPI;
window.checklistAPI = checklistAPI;
window.checklistItemAPI = checklistItemAPI;
window.checklistItemMediaAPI = checklistItemMediaAPI;
window.dailyVideoAPI = dailyVideoAPI;
window.escalationAPI = escalationAPI;
window.integrationAPI = integrationAPI;
window.followUpAPI = followUpAPI;
window.hazardAssignmentAPI = hazardAssignmentAPI;
window.hazardAuditAPI = hazardAuditAPI;
window.hazardCategoryAPI = hazardCategoryAPI;
window.hazardMediaAPI = hazardMediaAPI;
window.hazardReportAPI = hazardReportAPI;
window.notificationAPI = notificationAPI;
window.payrollAPI = payrollAPI;
window.roleAPI = roleAPI;
window.safetyPromptAPI = safetyPromptAPI;
window.safetyVideoAPI = safetyVideoAPI;
window.severityTagAPI = severityTagAPI;

console.log("API client loaded with all project modules.");
