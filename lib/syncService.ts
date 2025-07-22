import { offlineStorage } from './offlineStorage';

class SyncService {
  private isOnline = false;
  private syncInProgress = false;
  private syncQueue: Set<string> = new Set();
  private isClient = false;

  constructor() {
    // Verificar se estamos no cliente
    this.isClient = typeof window !== 'undefined';
    
    if (this.isClient) {
      this.isOnline = navigator.onLine;
      this.setupNetworkListeners();
      this.setupPeriodicSync();
    }
  }

  private setupNetworkListeners(): void {
    if (!this.isClient) return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupPeriodicSync(): void {
    if (!this.isClient) return;

    // Tentar sincronizar a cada 30 segundos quando online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.triggerSync();
      }
    }, 30000);
  }

  async triggerSync(): Promise<void> {
    if (!this.isClient || this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;


    try {
      await this.syncPendingActions();
      await this.refreshCachedData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncPendingActions(): Promise<void> {
    if (!this.isClient) return;

    const pendingActions = await offlineStorage.getPendingActions();


    // Processar em lotes de 10
    const batchSize = 10;
    for (let i = 0; i < pendingActions.length; i += batchSize) {
      const batch = pendingActions.slice(i, i + batchSize);
      await this.processBatch(batch);
    }
  }

  private async processBatch(actions: any[]): Promise<void> {
    const promises = actions.map(action => this.processAction(action));
    await Promise.allSettled(promises);
  }

  private async processAction(action: any): Promise<void> {
    if (!this.isClient) return;

    try {
      await offlineStorage.updateActionStatus(action.id, 'syncing');

      let response: Response;
      
      switch (action.type) {
        case 'CREATE_EMPLOYEE':
          response = await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.data)
          });
          break;

        case 'UPDATE_EMPLOYEE':
          response = await fetch(`/api/employees/${action.data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.data.updates)
          });
          break;

        case 'CREATE_NFC_BADGE':
          response = await fetch('/api/nfc-badges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.data)
          });
          break;

        case 'ASSIGN_NFC_BADGE':
          response = await fetch(`/api/nfc-badges/${action.data.badgeId}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.data.assignData)
          });
          break;

        case 'REVOKE_NFC_BADGE':
          response = await fetch(`/api/nfc-badges/${action.data.badgeId}/revoke`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.data)
          });
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      if (response.ok) {
        await offlineStorage.updateActionStatus(action.id, 'synced');
        await offlineStorage.removeAction(action.id);

      } else {
        throw new Error(`Server error: ${response.status}`);
      }

    } catch (error) {
      console.error(`Failed to sync action ${action.id}:`, error);
      const newRetries = action.retries + 1;
      
      if (newRetries >= 3) {
        await offlineStorage.updateActionStatus(action.id, 'failed', newRetries);
      } else {
        await offlineStorage.updateActionStatus(action.id, 'pending', newRetries);
      }
    }
  }

  private async refreshCachedData(): Promise<void> {
    if (!this.isClient) return;

    try {
      // Atualizar cache de funcionários
      const employeesResponse = await fetch('/api/employees');
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        await offlineStorage.cacheData('employees', employeesData);
      }

      // Atualizar cache de crachás NFC
      const badgesResponse = await fetch('/api/nfc-badges');
      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        await offlineStorage.cacheData('nfc-badges', badgesData);
      }

    } catch (error) {
      console.error('Failed to refresh cached data:', error);
    }
  }

  async addToQueue(action: any): Promise<string> {
    if (!this.isClient) {
      console.warn('Sync service not available on server side');
      return '';
    }
    return await offlineStorage.addPendingAction(action);
  }

  isOffline(): boolean {
    if (!this.isClient) return false;
    return !this.isOnline;
  }

  async getPendingCount(): Promise<number> {
    if (!this.isClient) return 0;
    return offlineStorage.getPendingActions().then(actions => actions.length);
  }
}

// Criar instância apenas no cliente
let syncServiceInstance: SyncService | null = null;

export const syncService = new Proxy({} as SyncService, {
  get(target, prop) {
    if (typeof window === 'undefined') {
      // No servidor, retornar funções vazias
      return () => Promise.resolve();
    }
    
    if (!syncServiceInstance) {
      syncServiceInstance = new SyncService();
    }
    
    return syncServiceInstance[prop as keyof SyncService];
  }
});

// Exportar também o offlineStorage para compatibilidade
export { offlineStorage } from './offlineStorage'; 
