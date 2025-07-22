import { useQuery } from '@tanstack/react-query';
import { EmployeeStatus } from '@/components/ui/status-badge';

interface EmployeeFilters {
  search?: string;
  isActive?: boolean;
  limit?: number;
  page?: number;
}

interface Employee {
  id: string;
  name: string;
  cpf: string;
  registration: string | null;
  company: string | null;
  avatar: string | null;
  isActive: boolean;
  status: EmployeeStatus; // Campo status tipado corretamente
  nfcBadge?: {
    id: string;
    badgeId: string;
    status: string;
  } | null;
}

interface EmployeesResponse {
  employees: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchEmployees(filters: EmployeeFilters = {}): Promise<EmployeesResponse> {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.page) params.append('page', filters.page.toString());

  const response = await fetch(`/api/employees?${params}`);
  if (!response.ok) {
    throw new Error('Erro ao buscar funcionários');
  }
  
  return response.json();
}

// Nova função para buscar funcionários com relacionamentos completos - SEM CACHE
async function fetchEmployeesWithRelations(filters: EmployeeFilters = {}): Promise<EmployeesResponse> {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.page) params.append('page', filters.page.toString());
  
  // Adicionar parâmetro para incluir relacionamentos
  params.append('include', 'companyFunction,currentContract,currentFunction');
  
  // Adicionar timestamp para evitar cache do browser
  params.append('_t', Date.now().toString());



  const response = await fetch(`/api/employees?${params}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  
  if (!response.ok) {
    throw new Error('Erro ao buscar funcionários com relacionamentos');
  }
  
  const data = await response.json();

  
  return data;
}

export function useEmployeesQuery(filters: EmployeeFilters = {}) {
  const queryKey = ['employees', filters];
  
  return useQuery({
    queryKey,
    queryFn: () => fetchEmployees(filters),
    staleTime: 1 * 60 * 1000, // 1 minuto para funcionários
    gcTime: 5 * 60 * 1000, // 5 minutos no cache
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
  });
}

// Nova query para funcionários com relacionamentos completos
export function useEmployeesWithRelationsQuery(filters: EmployeeFilters = {}) {
  const queryKey = ['employees', 'with-relations', filters];
  
  return useQuery({
    queryKey,
    queryFn: () => fetchEmployeesWithRelations(filters),
    staleTime: 0, // Sempre considerar dados como obsoletos
    gcTime: 1000, // Manter apenas 1 segundo no cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 2,
  });
}

export type { Employee, EmployeeFilters, EmployeesResponse }; 
