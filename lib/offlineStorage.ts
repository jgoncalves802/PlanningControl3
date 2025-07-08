interface OfflineAction {
  id: string;
  type: 'CREATE_EMPLOYEE' | 'UPDATE_EMPLOYEE' | 'CREATE_NFC_BADGE' | 'ASSIGN_NFC_BADGE' | 'REVOKE_NFC_BADGE';
  data: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

interface CachedData {
  employees: any[];
  nfcBadges: any[];
  lastSync: number;
}

class OfflineStorageManager {
  private dbName = 'planningcontrol_offline';
  private version = 1;
  private db: IDBDatabase | null = null;
  private isClient = typeof window !== 'undefined';

  async init(): Promise<void> {
    if (!this.isClient) {
      console.warn('IndexedDB not available on server side');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store para ações pendentes
        if (!db.objectStoreNames.contains('pendingActions')) {
          const actionsStore = db.createObjectStore('pendingActions', { keyPath: 'id' });
          actionsStore.createIndex('timestamp', 'timestamp');
          actionsStore.createIndex('status', 'status');
        }
        
        // Store para dados em cache
        if (!db.objectStoreNames.contains('cachedData')) {
          db.createObjectStore('cachedData', { keyPath: 'key' });
        }
      };
    });
  }

  async addPendingAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<string> {
    if (!this.isClient || !this.db) {
      console.warn('Offline storage not available');
      return '';
    }

    const fullAction: OfflineAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    };

    const transaction = this.db.transaction(['pendingActions'], 'readwrite');
    const store = transaction.objectStore('pendingActions');
    await store.add(fullAction);
    
    console.log('Action added to offline queue:', fullAction);
    return fullAction.id;
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    if (!this.isClient || !this.db) {
      return [];
    }

    const transaction = this.db.transaction(['pendingActions'], 'readonly');
    const store = transaction.objectStore('pendingActions');
    const index = store.index('status');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateActionStatus(id: string, status: OfflineAction['status'], retries?: number): Promise<void> {
    if (!this.isClient || !this.db) {
      return;
    }

    const transaction = this.db.transaction(['pendingActions'], 'readwrite');
    const store = transaction.objectStore('pendingActions');
    
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const action = getRequest.result;
      if (action) {
        action.status = status;
        if (retries !== undefined) action.retries = retries;
        store.put(action);
      }
    };
  }

  async removeAction(id: string): Promise<void> {
    if (!this.isClient || !this.db) {
      return;
    }

    const transaction = this.db.transaction(['pendingActions'], 'readwrite');
    const store = transaction.objectStore('pendingActions');
    await store.delete(id);
  }

  async cacheData(key: string, data: any): Promise<void> {
    if (!this.isClient || !this.db) {
      return;
    }

    const transaction = this.db.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    await store.put({ key, data, timestamp: Date.now() });
  }

  async getCachedData(key: string): Promise<any> {
    if (!this.isClient || !this.db) {
      return null;
    }

    const transaction = this.db.transaction(['cachedData'], 'readonly');
    const store = transaction.objectStore('cachedData');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = () => reject(request.error);
    });
  }
}

// Criar instância com proxy para funcionar no servidor
let offlineStorageInstance: OfflineStorageManager | null = null;

export const offlineStorage = new Proxy({} as OfflineStorageManager, {
  get(target, prop) {
    if (typeof window === 'undefined') {
      // No servidor, retornar funções vazias
      if (typeof prop === 'string' && ['init', 'addPendingAction', 'getPendingActions', 'updateActionStatus', 'removeAction', 'cacheData', 'getCachedData'].includes(prop)) {
        return () => Promise.resolve();
      }
      return undefined;
    }
    
    if (!offlineStorageInstance) {
      offlineStorageInstance = new OfflineStorageManager();
    }
    
    return offlineStorageInstance[prop as keyof OfflineStorageManager];
  }
}); 