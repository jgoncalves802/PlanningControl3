'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useEmployeeSync() {
  const queryClient = useQueryClient();

  // Função para sincronizar dados após atualização
  const syncEmployeeData = (updatedEmployee: any) => {

    
    // Atualizar cache da query com relacionamentos
    queryClient.setQueriesData(
      { queryKey: ['employees', 'with-relations'] },
      (oldData: any) => {
        if (!oldData?.employees) return oldData;
        
        return {
          ...oldData,
          employees: oldData.employees.map((emp: any) => 
            emp.id === updatedEmployee.id ? { ...emp, ...updatedEmployee } : emp
          )
        };
      }
    );
    
    // Atualizar cache da query básica
    queryClient.setQueriesData(
      { queryKey: ['employees'] },
      (oldData: any) => {
        if (!oldData?.employees) return oldData;
        
        return {
          ...oldData,
          employees: oldData.employees.map((emp: any) => 
            emp.id === updatedEmployee.id ? { ...emp, ...updatedEmployee } : emp
          )
        };
      }
    );
  };

  // Função para forçar atualização completa
  const forceRefresh = () => {

    
    // Invalidar todas as queries de funcionários
    queryClient.invalidateQueries({ 
      queryKey: ['employees'],
      exact: false 
    });
    
    queryClient.invalidateQueries({ 
      queryKey: ['employees', 'with-relations'],
      exact: false 
    });
    
    // Forçar refetch
    queryClient.refetchQueries({ 
      queryKey: ['employees'],
      exact: false 
    });
    
    queryClient.refetchQueries({ 
      queryKey: ['employees', 'with-relations'],
      exact: false 
    });
  };

  return {
    syncEmployeeData,
    forceRefresh,
  };
} 
