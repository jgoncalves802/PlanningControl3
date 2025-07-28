import { useQuery } from '@tanstack/react-query';

// Interface para contrato ativo
export interface ActiveContract {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  workdayHours: number;
  includesWeekends: boolean;
  includesHolidays: boolean;
  createdAt: string;
  updatedAt: string;
  functions?: ContractFunction[];
  employeeCount?: number;
}

// Interface para função do contrato
export interface ContractFunction {
  id: string;
  name: string;
  isActive: boolean;
  employeeCount: number;
}

// Interface para resposta da API
export interface ActiveContractsResponse {
  contracts: ActiveContract[];
  total: number;
  timestamp: string;
}

// Interface para filtros
export interface ActiveContractsFilters {
  search?: string;
  includeFunctions?: boolean;
  includeEmployeeCount?: boolean;
}

// Hook para buscar contratos ativos
export function useActiveContracts(filters: ActiveContractsFilters = {}) {
  return useQuery({
    queryKey: ['active-contracts', filters],
    queryFn: async (): Promise<ActiveContractsResponse> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.includeFunctions) params.append('includeFunctions', 'true');
      if (filters.includeEmployeeCount) params.append('includeEmployeeCount', 'true');

      const response = await fetch(`/api/contracts/active?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao buscar contratos ativos');
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// Hook para buscar contratos ativos com funções (para transferências)
export function useActiveContractsWithFunctions(search?: string) {
  return useActiveContracts({
    search,
    includeFunctions: true,
    includeEmployeeCount: true
  });
}

// Hook para buscar contratos ativos simples (para dropdowns)
export function useActiveContractsSimple(search?: string) {
  return useActiveContracts({
    search,
    includeFunctions: false,
    includeEmployeeCount: false
  });
} 