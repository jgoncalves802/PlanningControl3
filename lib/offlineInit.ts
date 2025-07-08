import { offlineStorage, syncService } from './syncService';

export async function initializeOfflineSystem() {
  try {
    await offlineStorage.init();
    console.log('Offline system initialized');
    
    // Tentar sincronizar imediatamente se online
    if (navigator.onLine) {
      syncService.triggerSync();
    }
  } catch (error) {
    console.error('Failed to initialize offline system:', error);
  }
} 