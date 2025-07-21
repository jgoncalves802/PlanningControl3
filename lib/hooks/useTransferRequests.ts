import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

interface UseTransferRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
  employeeId?: string;
  toContractId?: string;
  requestedById?: string;
  approvedById?: string;
  search?: string;
  enabled?: boolean;
}

export function useTransferRequests({
  page = 1,
  limit = 10,
  status,
  employeeId,
  toContractId,
  requestedById,
  approvedById,
  search,
  enabled = true,
}: UseTransferRequestsParams = {}) {
  const queryClient = useQueryClient();
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (status) params.set('status', status);
  if (employeeId) params.set('employeeId', employeeId);
  if (toContractId) params.set('toContractId', toContractId);
  if (requestedById) params.set('requestedById', requestedById);
  if (approvedById) params.set('approvedById', approvedById);
  if (search) params.set('search', search);

  const queryKey = ['transfer-requests', { page, limit, status, employeeId, toContractId, requestedById, approvedById, search }];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/transfer-requests?${params.toString()}`);
      if (!res.ok) throw new Error('Erro ao buscar transferências');
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
        queryClient.invalidateQueries({ queryKey: ['transfer-requests'] });
      }
    };
    return () => eventSource.close();
  }, [queryClient]);

  return query;
} 