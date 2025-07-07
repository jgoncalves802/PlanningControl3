import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEmployee, updateEmployee, deleteEmployee, addAdmission, addDismissal, updateEmployeeAvatar, updateEmploymentHistory } from './employeeService';

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; updates: any }, any, { id: string; updates: any }>({
    mutationFn: ({ id, updates }) => {
      console.log('=== MUTATION FUNCTION ===');
      console.log('ID:', id);
      console.log('Updates:', updates);
      return updateEmployee(id, updates);
    },
    onSuccess: (data, variables) => {
      console.log('=== MUTATION onSuccess ===');
      console.log('Data returned:', data);
      console.log('Variables used:', variables);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      console.log('Query invalidated');
    },
    onError: (error, variables) => {
      console.log('=== MUTATION onError ===');
      console.log('Error:', error);
      console.log('Variables used:', variables);
    }
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation<string, any, string>({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
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