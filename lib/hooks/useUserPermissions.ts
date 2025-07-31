import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ContractPermission {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  hasPermission: boolean;
  assignedAt: any;
}

export interface UserPermissionsResponse {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  permissions: ContractPermission[];
  stats: {
    totalContracts: number;
    assignedContracts: number;
  };
}

// Hook para listar permissões de um usuário
export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async (): Promise<UserPermissionsResponse> => {
      const response = await fetch(`/api/settings/super-admin/users/${userId}/permissions`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao buscar permissões do usuário');
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para adicionar permissão de contrato
export function useAddContractPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, contractId }: { userId: string; contractId: string }) => {
      const response = await fetch(`/api/settings/super-admin/users/${userId}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao adicionar permissão');
      }

      return response.json();
    },
    onSuccess: (_, { userId }) => {
      // Invalidar queries de permissões do usuário
      queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] });
      // Invalidar queries de usuários para atualizar contadores
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook para remover permissão de contrato
export function useRemoveContractPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, contractId }: { userId: string; contractId: string }) => {
      const response = await fetch(`/api/settings/super-admin/users/${userId}/permissions?contractId=${contractId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao remover permissão');
      }

      return response.json();
    },
    onSuccess: (_, { userId }) => {
      // Invalidar queries de permissões do usuário
      queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] });
      // Invalidar queries de usuários para atualizar contadores
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
} 