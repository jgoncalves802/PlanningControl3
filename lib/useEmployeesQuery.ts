import { useQuery } from '@tanstack/react-query';

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

export function useEmployeesQuery(filters: EmployeeFilters = {}) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => fetchEmployees(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
}

export type { Employee, EmployeeFilters, EmployeesResponse }; 