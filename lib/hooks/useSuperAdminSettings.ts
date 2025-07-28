import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Tipos
interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';
  companyId?: string;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  userCount: number;
  contractCount: number;
  createdAt: string;
  lastActivity: string;
}

interface InfrastructureData {
  system: {
    totalUsers: number;
    totalCompanies: number;
    totalContracts: number;
    activeUsers: number;
    uptime: string;
    lastBackup: string;
    totalRequests: number;
  };
  performance: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  servers: {
    web: 'online' | 'offline' | 'warning';
    database: 'online' | 'offline' | 'warning';
    cache: 'online' | 'offline' | 'warning';
  };
  config: {
    autoBackup: boolean;
    monitoringEnabled: boolean;
    alertThreshold: number;
    maintenanceMode: boolean;
    debugMode: boolean;
    logLevel: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  };
}

interface CreateUserData {
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';
  companyId?: string;
  password: string;
}

interface CreateCompanyData {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
}

// Hooks para Usuários
export function useUsers(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  companyId?: string;
}) {
  return useQuery({
    queryKey: ['super-admin', 'users', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.role) params.append('role', filters.role);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.companyId) params.append('companyId', filters.companyId);

      const response = await fetch(`/api/settings/super-admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }
      return response.json();
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const response = await fetch('/api/settings/super-admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await fetch(`/api/settings/super-admin/users/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/settings/super-admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] });
      toast.success('Usuário excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hooks para Empresas
export function useCompanies(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
}) {
  return useQuery({
    queryKey: ['super-admin', 'companies', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.plan) params.append('plan', filters.plan);

      const response = await fetch(`/api/settings/super-admin/companies?${params}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar empresas');
      }
      return response.json();
    },
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyData: CreateCompanyData) => {
      const response = await fetch('/api/settings/super-admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar empresa');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'companies'] });
      toast.success('Empresa criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Company> }) => {
      const response = await fetch(`/api/settings/super-admin/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar empresa');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'companies'] });
      toast.success('Empresa atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      const response = await fetch(`/api/settings/super-admin/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir empresa');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'companies'] });
      toast.success('Empresa excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hooks para Infraestrutura
export function useInfrastructureData() {
  return useQuery({
    queryKey: ['super-admin', 'infrastructure'],
    queryFn: async (): Promise<InfrastructureData> => {
      const response = await fetch('/api/settings/super-admin/infrastructure');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados de infraestrutura');
      }
      return response.json();
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
}

export function useUpdateInfrastructureConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<InfrastructureData['config']>) => {
      const response = await fetch('/api/settings/super-admin/infrastructure', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar configurações');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'infrastructure'] });
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useInfrastructureAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: 'backup' | 'restart-services') => {
      const response = await fetch('/api/settings/super-admin/infrastructure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao executar ação');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'infrastructure'] });
      toast.success(data.message || 'Ação executada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
} 