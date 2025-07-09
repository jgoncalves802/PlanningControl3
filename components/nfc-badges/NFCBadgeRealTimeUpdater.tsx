'use client';

import { useEffect } from 'react';
import { useNFCBadgeSSE } from '@/lib/hooks/useSSEConnection';

interface NFCBadgeRealTimeUpdaterProps {
  /** Se deve atualizar quando a janela recebe foco (mantido para compatibilidade) */
  updateOnFocus?: boolean;
  /** Se deve atualizar quando volta do modo offline (mantido para compatibilidade) */
  updateOnOnline?: boolean;
  /** Callback quando uma atualização é disparada */
  onUpdate?: () => void;
  /** Intervalo de atualização (DESCONTINUADO - agora usa SSE) */
  updateInterval?: number;
}

/**
 * Componente utilitário para garantir atualizações em tempo real dos crachás NFC via SSE
 * Substitui o sistema de polling anterior por Server-Sent Events
 */
export default function NFCBadgeRealTimeUpdater({
  updateOnFocus = true,
  updateOnOnline = true,
  onUpdate,
  updateInterval, // Mantido para compatibilidade, mas ignorado
}: NFCBadgeRealTimeUpdaterProps) {
  
  // Conectar ao SSE para atualizações em tempo real
  const { isConnected } = useNFCBadgeSSE();

  // Log de compatibilidade
  useEffect(() => {
    if (updateInterval) {
      console.warn('[NFCBadgeRealTimeUpdater] updateInterval is deprecated. Now using Server-Sent Events for real-time updates.');
    }
  }, [updateInterval]);

  // Callback quando recebemos atualizações via SSE
  useEffect(() => {
    if (isConnected && onUpdate) {
      console.log('[NFCBadgeRealTimeUpdater] SSE connected, real-time updates active');
      onUpdate();
    }
  }, [isConnected, onUpdate]);

  // Listeners para foco e online (mantidos como fallback)
  useEffect(() => {
    const handleFocus = () => {
      if (updateOnFocus && onUpdate) {
        console.log('[NFCBadgeRealTimeUpdater] Window focus - triggering update');
        onUpdate();
      }
    };

    const handleOnline = () => {
      if (updateOnOnline && onUpdate) {
        console.log('[NFCBadgeRealTimeUpdater] Back online - triggering update');
        onUpdate();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && updateOnFocus && onUpdate) {
        console.log('[NFCBadgeRealTimeUpdater] Page visible - triggering update');
        onUpdate();
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
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateOnFocus, updateOnOnline, onUpdate]);

  // Componente não renderiza nada visível
  return null;
}

// Hook para usar SSE programaticamente (compatibilidade com API anterior)
export function useNFCBadgeAutoUpdater(options: NFCBadgeRealTimeUpdaterProps = {}) {
  const { isConnected } = useNFCBadgeSSE();

  useEffect(() => {
    const {
      updateInterval, // Ignorado - compatibilidade
      updateOnFocus = true,
      updateOnOnline = true,
      onUpdate,
    } = options;

    // Log de compatibilidade
    if (updateInterval) {
      console.warn('[useNFCBadgeAutoUpdater] updateInterval is deprecated. Now using Server-Sent Events.');
    }

    // Listeners mantidos como fallback
    const handleFocus = () => {
      if (updateOnFocus && onUpdate) {
        console.log('[useNFCBadgeAutoUpdater] Window focus fallback update');
        onUpdate();
      }
    };

    const handleOnline = () => {
      if (updateOnOnline && onUpdate) {
        console.log('[useNFCBadgeAutoUpdater] Online fallback update');
        onUpdate();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && updateOnFocus && onUpdate) {
        console.log('[useNFCBadgeAutoUpdater] Visibility fallback update');
        onUpdate();
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
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [options.updateInterval, options.updateOnFocus, options.updateOnOnline, options.onUpdate]);

  return { 
    isConnected, // Novo: status da conexão SSE
    // Mantido para compatibilidade:
    forceRefreshAll: () => {
      console.log('[useNFCBadgeAutoUpdater] forceRefreshAll called - using SSE invalidation');
    }
  };
} 