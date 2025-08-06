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
    // Limpar conexão anterior se existir
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = (event) => {
        console.log('[SSE] Connection opened:', url);
        reconnectCountRef.current = 0; // Reset reconnect count on successful connection
        onOpen?.(event);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('[SSE] Failed to parse message:', error);
        }
      };

      // Adicionar listener específico para employee-update
      eventSource.addEventListener('employee-update', (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('[SSE] Failed to parse employee update:', error);
        }
      });

      eventSource.onerror = (event) => {
        console.error('[SSE] Connection error:', event);
        onError?.(event);

        if (autoReconnect && reconnectCountRef.current < 5) {
          const delay = reconnectDelay * Math.pow(2, reconnectCountRef.current); // Exponential backoff
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current++;
            connect();
          }, delay);
        }
      };

      // Add specific event listeners
      eventSource.addEventListener('connection', (event) => {
        console.log('[SSE] Connection event received');
      });

      eventSource.addEventListener('heartbeat', (event) => {
        console.log('[SSE] Heartbeat received');
      });

      eventSource.addEventListener('nfc-badge-update', (event) => {
        try {
          const data = JSON.parse(event.data);
          
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
          
          // Invalidate stats queries specifically
          queryClient.invalidateQueries({ queryKey: ['nfc-badges', 'stats'] });
          
          onMessage?.(data);
        } catch (error) {
          console.error('[SSE] Failed to parse stats update:', error);
        }
      });

    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error);
      onError?.(new Event('error'));
    }
  };

  const disconnect = () => {
    console.log('[SSE] Disconnecting:', url);
    
    // Limpar timeout de reconexão
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Fechar conexão SSE
    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
      } catch (error) {
        console.warn('[SSE] Error closing connection:', error);
      }
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

    },
  });
} 

// Hook específico para funcionários (SSE)
export function useEmployeesSSE(onUpdate?: () => void) {
  const queryClient = useQueryClient();
  const { isConnected } = useSSEConnection({
    url: '/api/employees/events',
    onMessage: (data) => {

      
      if (data.type === 'created' || data.type === 'updated' || data.type === 'deleted') {


        
        // Invalidar todas as queries relacionadas a funcionários (incluindo as com filtros)

        
        // Invalidar queries relacionadas (simples e direto)
        queryClient.invalidateQueries({ 
          queryKey: ['employees'],
          exact: false 
        });
        
        // Invalidar outras queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['workforce'] });
        

        
        // Chamar callback para forçar re-renderização
        if (onUpdate) {

          onUpdate();
        }
        
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

    },
  });

  return { isConnected };
} 
