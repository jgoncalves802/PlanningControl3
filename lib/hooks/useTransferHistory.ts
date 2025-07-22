import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

interface UseTransferHistoryParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  contractId?: string;
  functionId?: string;
  date?: string;
  enabled?: boolean;
}

export function useTransferHistory({
  page = 1,
  limit = 20,
  employeeId,
  contractId,
  functionId,
  date,
  enabled = true,
}: UseTransferHistoryParams = {}) {
  const queryClient = useQueryClient();
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (employeeId) params.set('employeeId', employeeId);
  if (contractId) params.set('contractId', contractId);
  if (functionId) params.set('functionId', functionId);
  if (date) params.set('date', date);

  const queryKey = ['transfer-history', { page, limit, employeeId, contractId, functionId, date }];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/transfer-requests/history?${params.toString()}`);
      if (!res.ok) throw new Error('Erro ao buscar histórico de transferências');
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
        queryClient.invalidateQueries({ queryKey: ['transfer-history'] });
      }
    };
    return () => eventSource.close();
  }, [queryClient]);

  return query;
} 
