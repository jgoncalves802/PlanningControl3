import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useTransferMutation() {
  const queryClient = useQueryClient();

  // Aprovar, concluir, atualizar status
  const updateTransfer = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await fetch(`/api/transfer-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao atualizar transferência');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-requests'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-history'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-stats'] });
    },
  });

  // Rejeitar (soft delete)
  const rejectTransfer = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transfer-requests/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao rejeitar transferência');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-requests'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-history'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-stats'] });
    },
  });

  return { updateTransfer, rejectTransfer };
} 