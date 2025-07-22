'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useEmployeeDebug() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Monitorar mudanças no cache de funcionários
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === 'employees') {
        console.log('[Employee Debug] Cache event:', {
          type: event.type,
          queryKey: event.query.queryKey,
          data: event.query.state.data,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  // Função para forçar atualização manual
  const forceRefresh = () => {
    console.log('[Employee Debug] Forcing manual refresh...');
    queryClient.invalidateQueries({ 
      queryKey: ['employees'],
      exact: false 
    });
    queryClient.refetchQueries({ 
      queryKey: ['employees'],
      exact: false 
    });
  };

  // Função para verificar estado do cache
  const checkCache = () => {
    const cache = queryClient.getQueryCache();
    const employeeQueries = cache.getAll().filter(query => 
      query.queryKey[0] === 'employees'
    );
    
    console.log('[Employee Debug] Cache state:', {
      totalQueries: employeeQueries.length,
              queries: employeeQueries.map(q => ({
          key: q.queryKey,
          data: q.state.data,
          isStale: q.isStale(),
          isFetching: q.state.fetchStatus === 'fetching',
        }))
    });
  };

  return {
    forceRefresh,
    checkCache,
  };
} 
