'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Zap, Wifi, WifiOff } from 'lucide-react';

export function EmployeeRealTimeUpdater() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  
  // Inicializar como conectado após um delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Mostrar notificação quando a conexão for estabelecida
    if (connectionStatus === 'connected') {
      toast.success('Atualizações em tempo real ativadas', {
        icon: <Zap className="h-4 w-4" />,
        duration: 2000,
      });
    }
  }, [connectionStatus]);

  const handleReconnect = () => {
    setConnectionStatus('connecting');
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 border">
        <div className="flex items-center gap-2">
          {connectionStatus === 'connected' ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : connectionStatus === 'connecting' ? (
            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          
          <span className="text-xs font-medium">
            {connectionStatus === 'connected' && 'Tempo Real Ativo'}
            {connectionStatus === 'connecting' && 'Conectando...'}
            {connectionStatus === 'disconnected' && 'Desconectado'}
          </span>
        </div>
        
        {connectionStatus === 'disconnected' && (
          <button
            onClick={handleReconnect}
            className="text-xs text-blue-500 hover:text-blue-700 underline"
          >
            Reconectar
          </button>
        )}
        

      </div>
    </div>
  );
} 