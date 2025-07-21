'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface SSEOptions {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

export function useSSEConnection({
  url,
  onMessage,
  onError,
  onOpen,
  autoReconnect = true,
  reconnectDelay = 3000,
}: SSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const queryClient = useQueryClient();

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    console.log('[SSE] Connecting to:', url);
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = (event) => {
      console.log('[SSE] Connection opened successfully');
      reconnectCountRef.current = 0; // Reset reconnect count on successful connection
      onOpen?.(event);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Message received:', data);
        onMessage?.(data);
      } catch (error) {
        console.error('[SSE] Failed to parse message:', error);
      }
    };

    eventSource.onerror = (event) => {
      console.error('[SSE] Connection error:', event);
      onError?.(event);

      if (autoReconnect && reconnectCountRef.current < 5) {
        const delay = reconnectDelay * Math.pow(2, reconnectCountRef.current); // Exponential backoff
        console.log(`[SSE] Reconnecting in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectCountRef.current++;
          connect();
        }, delay);
      }
    };

    // Add specific event listeners
    eventSource.addEventListener('connection', (event) => {
      console.log('[SSE] Connection established:', event.data);
    });

    eventSource.addEventListener('heartbeat', (event) => {
      console.log('[SSE] Heartbeat received');
    });

    eventSource.addEventListener('nfc-badge-update', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] NFC Badge update received:', data.eventType, data.data?.badgeId);
        
        // Invalidate and refetch relevant queries immediately
        queryClient.invalidateQueries({ queryKey: ['nfc-badges'] });
        queryClient.refetchQueries({ queryKey: ['nfc-badges'] });
        queryClient.invalidateQueries({ queryKey: ['employees'] });
        queryClient.invalidateQueries({ queryKey: ['workforce'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        
        onMessage?.(data);
      } catch (error) {
        console.error('[SSE] Failed to parse badge update:', error);
      }
    });

    eventSource.addEventListener('stats-update', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Stats update:', data);
        
        // Invalidate stats queries specifically
        queryClient.invalidateQueries({ queryKey: ['nfc-badges', 'stats'] });
        
        onMessage?.(data);
      } catch (error) {
        console.error('[SSE] Failed to parse stats update:', error);
      }
    });
  };

  const disconnect = () => {
    console.log('[SSE] Disconnecting...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [url]);

  return {
    connect,
    disconnect,
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    eventSource: eventSourceRef.current,
  };
}

// Hook específico para NFC Badges
export function useNFCBadgeSSE() {
  const queryClient = useQueryClient();

  return useSSEConnection({
    url: '/api/nfc-badges/events',
    onMessage: (data) => {
      // Handle specific NFC badge events
      if (data.type === 'nfc-badge-update') {
        console.log(`[NFC SSE] Badge ${data.eventType}:`, data.data);
        
        // Trigger immediate refetch for better responsiveness
        queryClient.refetchQueries({ queryKey: ['nfc-badges'] });
        
        // Show toast notification if needed
        // toast.success(`Crachá ${data.data.badgeId} foi ${data.eventType === 'assign' ? 'atribuído' : 'atualizado'}`);
      }
    },
    onError: (error) => {
      console.warn('[NFC SSE] Connection error, falling back to polling');
      // Optionally enable polling as fallback here
    },
    onOpen: () => {
      console.log('[NFC SSE] Real-time updates enabled');
    },
  });
} 

// Hook específico para contratos (SSE)
export function useContractsSSE() {
  const queryClient = useQueryClient();

  return useSSEConnection({
    url: '/api/contracts/events',
    onMessage: (data) => {
      if (data.type === 'created' || data.type === 'updated' || data.type === 'deleted') {
        // Refetch contratos e dashboards
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
        queryClient.refetchQueries({ queryKey: ['contracts'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.refetchQueries({ queryKey: ['dashboard'] });
      }
    },
    onError: (error) => {
      console.warn('[Contracts SSE] Connection error, falling back to polling');
    },
    onOpen: () => {
      console.log('[Contracts SSE] Real-time updates enabled');
    },
  });
} 

// Hook específico para funcionários (SSE)
export function useEmployeesSSE() {
  const queryClient = useQueryClient();

  return useSSEConnection({
    url: '/api/employees/events',
    onMessage: (data) => {
      console.log('[Employees SSE] Received event:', data);
      
      if (data.type === 'created' || data.type === 'updated' || data.type === 'deleted') {
        // Invalidar e refazer fetch imediatamente para melhor responsividade
        queryClient.invalidateQueries({ queryKey: ['employees'] });
        queryClient.refetchQueries({ queryKey: ['employees'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.refetchQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['workforce'] });
        queryClient.refetchQueries({ queryKey: ['workforce'] });
        
        // Mostrar notificação para o usuário
        if (data.type === 'created') {
          toast.success('Novo funcionário adicionado', { duration: 3000 });
        } else if (data.type === 'updated') {
          toast.success('Funcionário atualizado', { duration: 3000 });
        } else if (data.type === 'deleted') {
          toast.success('Funcionário removido', { duration: 3000 });
        }
      }
    },
    onError: (error) => {
      console.warn('[Employees SSE] Connection error, falling back to polling');
      toast.error('Conexão de tempo real perdida', { duration: 5000 });
    },
    onOpen: () => {
      console.log('[Employees SSE] Real-time updates enabled');
    },
  });
} 