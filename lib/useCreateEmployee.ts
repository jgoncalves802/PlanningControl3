import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEmployee, updateEmployee, deleteEmployee, addAdmission, addDismissal, updateEmployeeAvatar, updateEmploymentHistory } from './employeeService';

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      // Invalidar TODAS as queries de funcionários (com e sem filtros)
      queryClient.invalidateQueries({ 
        queryKey: ['employees'],
        exact: false 
      });
      
      // Invalidar também a query com relacionamentos
      queryClient.invalidateQueries({ 
        queryKey: ['employees', 'with-relations'],
        exact: false 
      });
      
      queryClient.invalidateQueries({ queryKey: ['functions'] });
      
      // Forçar refetch imediato
      queryClient.refetchQueries({ 
        queryKey: ['employees'],
        exact: false 
      });
      
      queryClient.refetchQueries({ 
        queryKey: ['employees', 'with-relations'],
        exact: false 
      });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation<any, any, { id: string; updates: any }>(
    {
      mutationFn: ({ id, updates }) => updateEmployee(id, updates),
      onSuccess: async (serverResponse, variables) => {
        // Invalidar todas as queries de funcionários
        queryClient.invalidateQueries({ 
          queryKey: ['employees'],
          exact: false 
        });
        
        // Invalidar também o cache de funções para atualizar contagens
        queryClient.invalidateQueries({ 
          queryKey: ['functions'],
          exact: false 
        });
        
        // Forçar refetch imediato
        await queryClient.refetchQueries({ 
          queryKey: ['employees'],
          exact: false 
        });
        
        await queryClient.refetchQueries({ 
          queryKey: ['functions'],
          exact: false 
        });
      },
      onError: (error, variables) => {
        console.error('Erro ao atualizar funcionário:', error);
      }
    }
  );
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation<any, any, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar funcionário');
      }
      
      return response.json();
    },
    onSuccess: (data, employeeId) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['functions'] });
    },
    onError: (error: any, employeeId) => {
      console.error('Erro ao deletar funcionário:', error);
      
      // Se o erro for relacionado a transferências, mostrar mensagem específica
      if (error.message && error.message.includes('transferências')) {
        throw new Error(error.message);
      }
      
      // Para outros tipos de erro
      throw new Error(error.message || 'Erro ao deletar funcionário');
    },
  });
}

export function useAddAdmission() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; admission: any }, any, { id: string; admission: any }>({
    mutationFn: ({ id, admission }) => addAdmission(id, admission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['functions'] });
    },
  });
}

export function useAddDismissal() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; dismissalDate: string }, any, { id: string; dismissalDate: string }>({
    mutationFn: ({ id, dismissalDate }) => addDismissal(id, dismissalDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['functions'] });
    },
  });
}

export function useUpdateEmployeeAvatar() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; avatar: string }, any, { id: string; avatar: string }>({
    mutationFn: ({ id, avatar }) => updateEmployeeAvatar(id, avatar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['functions'] });
    },
  });
}

export function useUpdateEmploymentHistory() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; employmentHistory: any[] }, any, { id: string; employmentHistory: any[] }>({
    mutationFn: ({ id, employmentHistory }) => updateEmploymentHistory(id, employmentHistory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['functions'] });
    },
  });
} 
