'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const updateStatus = async () => {
      if (typeof window !== 'undefined') {
        setIsOnline(navigator.onLine);
        try {
          const { syncService } = await import('@/lib/syncService');
          const count = await syncService.getPendingCount();
          setPendingCount(count);
        } catch (error) {
          console.error('Error getting pending count:', error);
        }
      }
    };

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      try {
        const { syncService } = await import('@/lib/syncService');
        await syncService.triggerSync();
      } catch (error) {
        console.error('Error triggering sync:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsSyncing(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Atualizar status periodicamente
      const interval = setInterval(updateStatus, 5000);

      updateStatus();

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
      };
    }
  }, [isClient]);

  if (!isClient) {
    return null; // Não renderizar no servidor
  }

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm">
        <CheckCircle className="h-4 w-4" />
        <span>Sincronizado</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm">
        <WifiOff className="h-4 w-4" />
        <span>Offline</span>
        {pendingCount > 0 && (
          <span className="bg-orange-200 px-2 py-0.5 rounded-full text-xs">
            {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Sincronizando...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
      <AlertCircle className="h-4 w-4" />
      <span>Pendente</span>
      <span className="bg-yellow-200 px-2 py-0.5 rounded-full text-xs">
        {pendingCount}
      </span>
    </div>
  );
} 