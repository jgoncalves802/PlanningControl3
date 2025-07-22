'use client';

import { useQueryClient } from '@tanstack/react-query';

export function useEmployeeTestUpdate() {
  const queryClient = useQueryClient();

  const testUpdate = async (employeeId: string, newData: any) => {


    
    // 1. Verificar cache atual
    const currentCache = queryClient.getQueriesData({ queryKey: ['employees'] });

    
    // 2. Fazer a atualização via API
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update employee');
      }
      
      const updatedEmployee = await response.json();

      
      // 3. Forçar limpeza e refetch do cache

      queryClient.removeQueries({ queryKey: ['employees'] });
      

      queryClient.invalidateQueries({ queryKey: ['employees'] });
      

      await queryClient.refetchQueries({ queryKey: ['employees'] });
      
      // 4. Verificar cache após atualização
      const newCache = queryClient.getQueriesData({ queryKey: ['employees'] });

      
      return updatedEmployee;
    } catch (error) {
      console.error('[Test Update] Error:', error);
      throw error;
    }
  };

  return { testUpdate };
} 
