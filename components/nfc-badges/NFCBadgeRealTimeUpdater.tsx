'use client';

import { useEffect, useRef } from 'react';
import { useNFCBadgeRealtimeUpdates } from '@/lib/useNFCBadges';

interface NFCBadgeRealTimeUpdaterProps {
  /** Intervalo de atualização em milissegundos (padrão: 30 segundos) */
  updateInterval?: number;
  /** Se deve atualizar quando a janela recebe foco */
  updateOnFocus?: boolean;
  /** Se deve atualizar quando volta do modo offline */
  updateOnOnline?: boolean;
  /** Callback quando uma atualização é disparada */
  onUpdate?: () => void;
}

/**
 * Componente utilitário para garantir atualizações em tempo real dos crachás NFC
 * Pode ser usado em qualquer página que precisa de dados atualizados
 */
export default function NFCBadgeRealTimeUpdater({
  updateInterval = 30000, // 30 segundos
  updateOnFocus = true,
  updateOnOnline = true,
  onUpdate,
}: NFCBadgeRealTimeUpdaterProps) {
  const { forceRefreshAll } = useNFCBadgeRealtimeUpdates();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleUpdate = () => {
    console.log('[NFC Badge Realtime] Forcing update...');
    forceRefreshAll();
    onUpdate?.();
  };

  useEffect(() => {
    // Configurar intervalo de atualização
    if (updateInterval > 0) {
      intervalRef.current = setInterval(handleUpdate, updateInterval);
    }

    // Configurar listener de foco
    const handleFocus = () => {
      if (updateOnFocus) {
        handleUpdate();
      }
    };

    // Configurar listener de online
    const handleOnline = () => {
      if (updateOnOnline) {
        handleUpdate();
      }
    };

    // Configurar listener de visibilidade
    const handleVisibilityChange = () => {
      if (!document.hidden && updateOnFocus) {
        handleUpdate();
      }
    };

    if (updateOnFocus) {
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (updateOnOnline) {
      window.addEventListener('online', handleOnline);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateInterval, updateOnFocus, updateOnOnline, onUpdate]);

  // Componente não renderiza nada visível
  return null;
}

// Hook para usar o updater programaticamente
export function useNFCBadgeAutoUpdater(options: NFCBadgeRealTimeUpdaterProps = {}) {
  const { forceRefreshAll } = useNFCBadgeRealtimeUpdates();

  useEffect(() => {
    const {
      updateInterval = 30000,
      updateOnFocus = true,
      updateOnOnline = true,
      onUpdate,
    } = options;

    const handleUpdate = () => {
      console.log('[NFC Badge Realtime] Auto update triggered');
      forceRefreshAll();
      onUpdate?.();
    };

    let intervalId: NodeJS.Timeout | null = null;

    // Configurar intervalo de atualização
    if (updateInterval > 0) {
      intervalId = setInterval(handleUpdate, updateInterval);
    }

    // Configurar listeners
    const handleFocus = () => {
      if (updateOnFocus) {
        handleUpdate();
      }
    };

    const handleOnline = () => {
      if (updateOnOnline) {
        handleUpdate();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && updateOnFocus) {
        handleUpdate();
      }
    };

    if (updateOnFocus) {
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (updateOnOnline) {
      window.addEventListener('online', handleOnline);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [options.updateInterval, options.updateOnFocus, options.updateOnOnline, options.onUpdate]);

  return { forceRefreshAll };
} 