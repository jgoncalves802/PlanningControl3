import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEmployee, updateEmployee, deleteEmployee, addAdmission, addDismissal, updateEmployeeAvatar, updateEmploymentHistory } from './employeeService';

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['functions'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; updates: any }, any, { id: string; updates: any }>({
    mutationFn: ({ id, updates }) => updateEmployee(id, updates),
    onSuccess: (data, variables) => {
      // Invalidar todas as queries de employees de forma mais agressiva
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.refetchQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['functions'] });
      
      // Remover dados específicos do cache para forçar reload
      queryClient.removeQueries({ queryKey: ['employees'] });
    },
    onError: (error, variables) => {
      console.error('Erro na mutação de atualização:', error);
      console.error('Variáveis usadas:', variables);
    }
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation<string, any, string>({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['functions'] });
    },
  });
}

export function useAddAdmission() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; admission: any }, any, { id: string; admission: any }>({
    mutationFn: ({ id, admission }) => addAdmission(id, admission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useAddDismissal() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; dismissalDate: string }, any, { id: string; dismissalDate: string }>({
    mutationFn: ({ id, dismissalDate }) => addDismissal(id, dismissalDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployeeAvatar() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; avatar: string }, any, { id: string; avatar: string }>({
    mutationFn: ({ id, avatar }) => updateEmployeeAvatar(id, avatar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmploymentHistory() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; employmentHistory: any[] }, any, { id: string; employmentHistory: any[] }>({
    mutationFn: ({ id, employmentHistory }) => updateEmploymentHistory(id, employmentHistory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
} 