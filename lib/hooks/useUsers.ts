import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/lib/types/user';

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
}

export interface UpdateUserData {
  id: string;
  name?: string;
  email?: string;
}

// Hook para listar usuários
export function useUsers(page = 1, limit = 10, search = '', role = '', status = '') {
  return useQuery({
    queryKey: ['users', page, limit, search, role, status],
    queryFn: async (): Promise<UsersResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status })
      });

      const response = await fetch(`/api/settings/super-admin/users?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao buscar usuários');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para criar usuário
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData): Promise<{ message: string; user: User }> => {
      const response = await fetch('/api/settings/super-admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar queries de usuários
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook para atualizar usuário
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserData): Promise<{ message: string; user: User }> => {
      const response = await fetch('/api/settings/super-admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar queries de usuários
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook para deletar usuário
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<{ message: string }> => {
      const response = await fetch(`/api/settings/super-admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar queries de usuários
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
} 