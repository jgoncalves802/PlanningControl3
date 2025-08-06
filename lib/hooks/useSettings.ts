'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// ========================================
// HOOKS PARA SUPER ADMIN
// ========================================

// Hook para buscar todas as empresas
export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await fetch('/api/settings/super-admin/companies');
      if (!response.ok) {
        throw new Error('Erro ao buscar empresas');
      }
      const data = await response.json();
      return data.data;
    }
  });
};

// Hook para buscar empresa específica
export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const response = await fetch(`/api/settings/super-admin/companies/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar empresa');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!id
  });
};

// Hook para criar empresa
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyData: any) => {
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

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Hook para atualizar empresa
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
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

      const result = await response.json();
      return result.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', id] });
      toast.success('Empresa atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Hook para deletar empresa
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/settings/super-admin/companies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar empresa');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa deletada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Hook para buscar infraestrutura
export const useInfrastructure = () => {
  return useQuery({
    queryKey: ['infrastructure'],
    queryFn: async () => {
      const response = await fetch('/api/settings/super-admin/infrastructure');
      if (!response.ok) {
        throw new Error('Erro ao buscar infraestrutura');
      }
      const data = await response.json();
      return data.data;
    }
  });
};

// Hook para buscar infraestrutura específica
export const useInfrastructureItem = (id: string) => {
  return useQuery({
    queryKey: ['infrastructure', id],
    queryFn: async () => {
      const response = await fetch(`/api/settings/super-admin/infrastructure/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar infraestrutura');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!id
  });
};

// Hook para criar infraestrutura
export const useCreateInfrastructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (infrastructureData: any) => {
      const response = await fetch('/api/settings/super-admin/infrastructure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(infrastructureData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar infraestrutura');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure'] });
      toast.success('Infraestrutura criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Hook para atualizar infraestrutura
export const useUpdateInfrastructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/settings/super-admin/infrastructure/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar infraestrutura');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure'] });
      queryClient.invalidateQueries({ queryKey: ['infrastructure', id] });
      toast.success('Infraestrutura atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Hook para deletar infraestrutura
export const useDeleteInfrastructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/settings/super-admin/infrastructure/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar infraestrutura');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure'] });
      toast.success('Infraestrutura deletada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// ========================================
// HOOKS PARA COMPANY ADMIN
// ========================================

// Hook para buscar configurações da empresa
export const useCompanySettings = (companyId: string) => {
  return useQuery({
    queryKey: ['company-settings', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/settings/company/${companyId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar configurações da empresa');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!companyId
  });
};

// Hook para atualizar configurações da empresa
export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, data }: { companyId: string; data: any }) => {
      const response = await fetch(`/api/settings/company/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar configurações');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['company-settings', companyId] });
      toast.success('Configurações atualizadas com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// ========================================
// HOOKS PARA USUÁRIO
// ========================================

// Hook para buscar configurações do usuário
export const useUserSettings = (userId: string) => {
  return useQuery({
    queryKey: ['user-settings', userId],
    queryFn: async () => {
      const response = await fetch(`/api/settings/user/${userId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar configurações do usuário');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!userId
  });
};

// Hook para atualizar configurações do usuário
export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const response = await fetch(`/api/settings/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar configurações');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', userId] });
      toast.success('Configurações atualizadas com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// ========================================
// HOOKS PARA AUDITORIA
// ========================================

// Hook para buscar logs de auditoria
export const useAuditLogs = (filters?: {
  userId?: string;
  companyId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.companyId) params.append('companyId', filters.companyId);
      if (filters?.action) params.append('action', filters.action);
      if (filters?.entityType) params.append('entityType', filters.entityType);
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());

      const response = await fetch(`/api/settings/audit-logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar logs de auditoria');
      }
      const data = await response.json();
      return data.data;
    }
  });
};

// ========================================
// HOOKS PARA ESTATÍSTICAS
// ========================================

// Hook para buscar estatísticas do sistema
export const useSystemStatistics = () => {
  return useQuery({
    queryKey: ['system-statistics'],
    queryFn: async () => {
      const response = await fetch('/api/settings/statistics/system');
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas do sistema');
      }
      const data = await response.json();
      return data.data;
    }
  });
};

// Hook para buscar estatísticas da empresa
export const useCompanyStatistics = (companyId: string) => {
  return useQuery({
    queryKey: ['company-statistics', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/settings/statistics/company/${companyId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas da empresa');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!companyId
  });
}; 