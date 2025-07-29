import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Tipos
interface CompanyInfo {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  language: string;
  customDomain?: string;
  isActive: boolean;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
  updatedAt: string;
}

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  department: string;
  position: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
}

interface CompanyContract {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  workdayHours: number;
  includesWeekends: boolean;
  includesHolidays: boolean;
  employeeCount: number;
  functionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: CompanyUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ContractsResponse {
  contracts: CompanyContract[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Hooks para informações da empresa
export function useCompanyInfo() {
  return useQuery({
    queryKey: ['company-info'],
    queryFn: async (): Promise<CompanyInfo> => {
      const response = await fetch('/api/settings/company/company-info');
      if (!response.ok) {
        throw new Error('Erro ao buscar informações da empresa');
      }
      return response.json();
    },
  });
}

export function useUpdateCompanyInfo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CompanyInfo>): Promise<CompanyInfo> => {
      const response = await fetch('/api/settings/company/company-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar informações da empresa');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      toast.success('Informações da empresa atualizadas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hooks para usuários da empresa
export function useCompanyUsers(filters?: {
  search?: string;
  department?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.department) queryParams.append('department', filters.department);
  if (filters?.role) queryParams.append('role', filters.role);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());

  return useQuery({
    queryKey: ['company-users', filters],
    queryFn: async (): Promise<UsersResponse> => {
      const response = await fetch(`/api/settings/company/users?${queryParams}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários da empresa');
      }
      return response.json();
    },
  });
}

export function useCreateCompanyUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CompanyUser>): Promise<CompanyUser> => {
      const response = await fetch('/api/settings/company/users', {
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
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCompanyUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyUser> }): Promise<CompanyUser> => {
      const response = await fetch(`/api/settings/company/users/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCompanyUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/settings/company/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir usuário');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast.success('Usuário excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hooks para contratos da empresa
export function useCompanyContracts(filters?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());

  return useQuery({
    queryKey: ['company-contracts', filters],
    queryFn: async (): Promise<ContractsResponse> => {
      const response = await fetch(`/api/settings/company/contracts?${queryParams}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar contratos da empresa');
      }
      return response.json();
    },
  });
}

export function useCreateCompanyContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CompanyContract>): Promise<CompanyContract> => {
      const response = await fetch('/api/settings/company/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar contrato');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-contracts'] });
      toast.success('Contrato criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCompanyContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyContract> }): Promise<CompanyContract> => {
      const response = await fetch(`/api/settings/company/contracts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar contrato');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-contracts'] });
      toast.success('Contrato atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCompanyContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/settings/company/contracts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir contrato');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-contracts'] });
      toast.success('Contrato excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
} 