import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useTransferStats(enabled = true) {
  const queryClient = useQueryClient();
  const queryKey = ['transfer-stats'];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch('/api/transfer-requests/stats');
      if (!res.ok) throw new Error('Erro ao buscar estatísticas de transferências');
      return res.json();
    },
    enabled,
    // @ts-ignore
    keepPreviousData: true,
  });

  // Atualização automática via SSE
  useEffect(() => {
    const eventSource = new EventSource('/api/transfer-requests/events');
    eventSource.onmessage = (event) => {
      const { type } = JSON.parse(event.data);
      if ([
        'created',
        'updated',
        'deleted',
      ].includes(type)) {
        queryClient.invalidateQueries({ queryKey });
      }
    };
    return () => eventSource.close();
  }, [queryClient]);

  return query;
} 