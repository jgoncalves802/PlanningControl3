import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface ToggleUserStatusParams {
  userId: string;
  isActive: boolean;
}

export function useToggleUserStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const toggleUserStatus = async ({ userId, isActive }: ToggleUserStatusParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/settings/super-admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao alterar status do usuário');
      }

      const data = await response.json();
      
      // Invalidar queries relacionadas a usuários
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toggleUserStatus,
    isLoading,
    error,
  };
} 