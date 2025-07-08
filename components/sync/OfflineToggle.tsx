'use client';

import { useState } from 'react';
import { Wifi, WifiOff, Globe, Smartphone, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOffline } from '@/lib/contexts/OfflineContext';
import { useQueryClient } from '@tanstack/react-query';

export default function OfflineToggle() {
  const { isOfflineMode, isConnected, toggleOfflineMode, forceOnlineMode } = useOffline();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      // Forçar modo online temporariamente para buscar dados
      forceOnlineMode();
      
      // Invalidar todas as queries para forçar refetch
      await queryClient.invalidateQueries();
      
      // Aguardar um pouco para as queries executarem
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-100 text-red-700 border-red-200';
    if (isOfflineMode) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Sem Conexão';
    if (isOfflineMode) return 'Modo Offline';
    return 'Modo Online';
  };

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff className="h-4 w-4" />;
    if (isOfflineMode) return <Smartphone className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Status Display */}
      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshData}
          disabled={isRefreshing || !isConnected}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </span>
        </Button>

        {/* Toggle Mode Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleOfflineMode}
          disabled={!isConnected}
          className="flex items-center gap-2"
        >
          {isOfflineMode ? (
            <>
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Ir Online</span>
            </>
          ) : (
            <>
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Ir Offline</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 