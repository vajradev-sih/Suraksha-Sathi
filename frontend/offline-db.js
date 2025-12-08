// IndexedDB Manager for Offline Storage
class OfflineDB {
  constructor() {
    this.dbName = 'SurakshaSathiDB';
    this.version = 1;
    this.db = null;
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('[OfflineDB] Error opening database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineDB] Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('[OfflineDB] Upgrading database...');

        // Create object stores if they don't exist

        // 1. Offline Queue - for pending API requests
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const queueStore = db.createObjectStore('offlineQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('endpoint', 'endpoint', { unique: false });
          queueStore.createIndex('method', 'method', { unique: false });
        }

        // 2. Hazard Reports - offline hazard reports
        if (!db.objectStoreNames.contains('hazardReports')) {
          const hazardStore = db.createObjectStore('hazardReports', {
            keyPath: 'localId',
            autoIncrement: true
          });
          hazardStore.createIndex('timestamp', 'timestamp', { unique: false });
          hazardStore.createIndex('synced', 'synced', { unique: false });
          hazardStore.createIndex('severity', 'severity', { unique: false });
        }

        // 3. Attendance Records - offline attendance
        if (!db.objectStoreNames.contains('attendance')) {
          const attendanceStore = db.createObjectStore('attendance', {
            keyPath: 'localId',
            autoIncrement: true
          });
          attendanceStore.createIndex('timestamp', 'timestamp', { unique: false });
          attendanceStore.createIndex('synced', 'synced', { unique: false });
          attendanceStore.createIndex('date', 'date', { unique: false });
        }

        // 4. Checklists - offline checklist submissions
        if (!db.objectStoreNames.contains('checklists')) {
          const checklistStore = db.createObjectStore('checklists', {
            keyPath: 'localId',
            autoIncrement: true
          });
          checklistStore.createIndex('timestamp', 'timestamp', { unique: false });
          checklistStore.createIndex('synced', 'synced', { unique: false });
        }

        // 5. Cached Data - for GET request responses
        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', {
            keyPath: 'key'
          });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        // 6. Media Files - offline media (photos, videos)
        if (!db.objectStoreNames.contains('mediaFiles')) {
          const mediaStore = db.createObjectStore('mediaFiles', {
            keyPath: 'id',
            autoIncrement: true
          });
          mediaStore.createIndex('timestamp', 'timestamp', { unique: false });
          mediaStore.createIndex('synced', 'synced', { unique: false });
          mediaStore.createIndex('relatedTo', 'relatedTo', { unique: false });
        }
      };
    });
  }

  // Generic add method
  async add(storeName, data) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic get method
  async get(storeName, key) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic get all method
  async getAll(storeName, indexName = null, query = null) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let request;
      if (indexName && query !== null) {
        const index = store.index(indexName);
        request = index.getAll(query);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic update method
  async update(storeName, data) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic delete method
  async delete(storeName, key) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear entire store
  async clear(storeName) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Ensure database is initialized
  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
  }

  // === Specific Methods for Common Operations ===

  // Queue offline request
  async queueRequest(endpoint, method, body, headers = {}) {
    const queueItem = {
      endpoint,
      method,
      body,
      headers,
      timestamp: Date.now(),
      retryCount: 0
    };
    return await this.add('offlineQueue', queueItem);
  }

  // Get all queued requests
  async getQueuedRequests() {
    return await this.getAll('offlineQueue');
  }

  // Save hazard report offline
  async saveHazardReport(reportData) {
    const report = {
      ...reportData,
      timestamp: Date.now(),
      synced: false
    };
    return await this.add('hazardReports', report);
  }

  // Get unsynced hazard reports
  async getUnsyncedHazardReports() {
    return await this.getAll('hazardReports', 'synced', false);
  }

  // Mark hazard report as synced
  async markHazardReportSynced(localId, serverId) {
    const report = await this.get('hazardReports', localId);
    if (report) {
      report.synced = true;
      report.serverId = serverId;
      report.syncedAt = Date.now();
      await this.update('hazardReports', report);
    }
  }

  // Save attendance offline
  async saveAttendance(attendanceData) {
    const attendance = {
      ...attendanceData,
      timestamp: Date.now(),
      synced: false
    };
    return await this.add('attendance', attendance);
  }

  // Get unsynced attendance records
  async getUnsyncedAttendance() {
    return await this.getAll('attendance', 'synced', false);
  }

  // Mark attendance as synced
  async markAttendanceSynced(localId, serverId) {
    const attendance = await this.get('attendance', localId);
    if (attendance) {
      attendance.synced = true;
      attendance.serverId = serverId;
      attendance.syncedAt = Date.now();
      await this.update('attendance', attendance);
    }
  }

  // Cache API response
  async cacheResponse(key, data, ttl = 3600000) { // Default TTL: 1 hour
    const cached = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };
    return await this.update('cachedData', cached);
  }

  // Get cached response
  async getCachedResponse(key) {
    const cached = await this.get('cachedData', key);
    if (!cached) return null;
    
    // Check if expired
    if (cached.expiresAt < Date.now()) {
      await this.delete('cachedData', key);
      return null;
    }
    
    return cached.data;
  }

  // Clean expired cache
  async cleanExpiredCache() {
    const allCached = await this.getAll('cachedData');
    const now = Date.now();
    const deletePromises = allCached
      .filter(item => item.expiresAt < now)
      .map(item => this.delete('cachedData', item.key));
    
    await Promise.all(deletePromises);
  }

  // Save media file
  async saveMediaFile(file, relatedTo) {
    const media = {
      file,
      relatedTo,
      timestamp: Date.now(),
      synced: false
    };
    return await this.add('mediaFiles', media);
  }

  // Get unsynced media files
  async getUnsyncedMedia() {
    return await this.getAll('mediaFiles', 'synced', false);
  }

  // Get database size estimate
  async getStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentUsed: (estimate.usage / estimate.quota * 100).toFixed(2)
      };
    }
    return null;
  }
}

// Create singleton instance
const offlineDB = new OfflineDB();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = offlineDB;
}
