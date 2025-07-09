import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  NFCBadge, 
  NFCBadgeFilters, 
  NFCBadgeStats, 
  NFCBadgeListResponse,
  CreateNFCBadgeData,
  UpdateNFCBadgeData,
  AssignNFCBadgeData,
  RevokeNFCBadgeData,
} from '@/lib/types/nfc-badges';

// Chaves de query
const QUERY_KEYS = {
  badges: ['nfc-badges'] as const,
  badgesList: (filters: NFCBadgeFilters) => ['nfc-badges', 'list', filters] as const,
  badge: (id: string) => ['nfc-badges', 'detail', id] as const,
  stats: ['nfc-badges', 'stats'] as const,
};

// Funções de API
const api = {
  // Listar crachás
  async getBadges(filters: NFCBadgeFilters & { page?: number; limit?: number }): Promise<NFCBadgeListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.assignedEmployee && filters.assignedEmployee !== 'all') params.append('assignedEmployee', filters.assignedEmployee);

    const response = await fetch(`/api/nfc-badges?${params}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar crachás');
    }
    return response.json();
  },

  // Buscar crachá específico
  async getBadge(id: string): Promise<NFCBadge> {
    const response = await fetch(`/api/nfc-badges/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar crachá');
    }
    return response.json();
  },

  // Criar crachá
  async createBadge(data: CreateNFCBadgeData): Promise<NFCBadge> {
    const response = await fetch('/api/nfc-badges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar crachá');
    }
    return response.json();
  },

  // Atualizar crachá
  async updateBadge(id: string, data: UpdateNFCBadgeData): Promise<NFCBadge> {
    const response = await fetch(`/api/nfc-badges/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar crachá');
    }
    return response.json();
  },

  // Deletar crachá
  async deleteBadge(id: string): Promise<void> {
    const response = await fetch(`/api/nfc-badges/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar crachá');
    }
  },

  // Atribuir crachá
  async assignBadge(id: string, data: AssignNFCBadgeData): Promise<NFCBadge> {
    const response = await fetch(`/api/nfc-badges/${id}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atribuir crachá');
    }
    return response.json();
  },

  // Revogar crachá
  async revokeBadge(id: string, data: RevokeNFCBadgeData): Promise<NFCBadge> {
    const response = await fetch(`/api/nfc-badges/${id}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao revogar crachá');
    }
    return response.json();
  },

  // Buscar estatísticas
  async getStats(): Promise<NFCBadgeStats> {
    const response = await fetch('/api/nfc-badges/stats');
    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }
    return response.json();
  },

  // Processar scan NFC
  async processScan(badgeId: string, location?: string): Promise<any> {
    const response = await fetch('/api/nfc-badges/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        badgeId,
        location,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao processar scan');
    }
    return response.json();
  },
};

// Hooks
export function useNFCBadgesQuery(filters: NFCBadgeFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.badgesList(filters),
    queryFn: () => api.getBadges(filters),
    staleTime: 30 * 1000, // 30 segundos - mais agressivo para atualizações
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true, // Atualiza quando a janela recebe foco
    refetchInterval: 60 * 1000, // Auto-refresh a cada 60 segundos
    refetchIntervalInBackground: false, // Não atualiza em background
  });
}

export function useNFCBadgeQuery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.badge(id),
    queryFn: () => api.getBadge(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
}

export function useNFCBadgeStatsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: api.getStats,
    staleTime: 30 * 1000, // 30 segundos - mais agressivo para estatísticas
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30 * 1000, // Auto-refresh a cada 30 segundos
    refetchIntervalInBackground: false, // Não atualiza em background
    refetchOnWindowFocus: true, // Atualiza quando a janela recebe foco
  });
}

export function useCreateNFCBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNFCBadgeData) => {
      const response = await fetch('/api/nfc-badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create NFC badge');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidar todas as queries relacionadas a crachás para atualização imediata
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badge(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      
      // Invalidar queries de funcionários também
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Invalidar queries de workforce (controle de ponto)
      queryClient.invalidateQueries({ queryKey: ['workforce'] });
      
      // Invalidar queries de dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forçar refetch imediato para todas as listas de crachás
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.stats });
      
      toast.success('Crachá criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar crachá');
    },
  });
}

export function useUpdateNFCBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNFCBadgeData }) => 
      api.updateBadge(id, data),
    onSuccess: (data) => {
      // Invalidar todas as queries relacionadas a crachás para atualização imediata
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badge(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      
      // Invalidar queries de funcionários também
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Invalidar queries de workforce (controle de ponto)
      queryClient.invalidateQueries({ queryKey: ['workforce'] });
      
      // Invalidar queries de dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forçar refetch imediato para todas as listas de crachás
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.stats });
      
      toast.success('Crachá atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar crachá');
    },
  });
}

export function useDeleteNFCBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteBadge,
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a crachás para atualização imediata
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      
      // Invalidar queries de funcionários também
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Invalidar queries de workforce (controle de ponto)
      queryClient.invalidateQueries({ queryKey: ['workforce'] });
      
      // Invalidar queries de dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forçar refetch imediato para todas as listas de crachás
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.stats });
      
      toast.success('Crachá deletado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao deletar crachá');
    },
  });
}

export function useAssignNFCBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignNFCBadgeData }) => 
      api.assignBadge(id, data),
    onSuccess: (data) => {
      // Invalidar todas as queries relacionadas a crachás para atualização imediata
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badge(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      
      // Invalidar queries de funcionários também
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Invalidar queries de workforce (controle de ponto)
      queryClient.invalidateQueries({ queryKey: ['workforce'] });
      
      // Invalidar queries de dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forçar refetch imediato para todas as listas de crachás
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.stats });
      
      toast.success('Crachá atribuído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atribuir crachá');
    },
  });
}

export function useRevokeNFCBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RevokeNFCBadgeData }) => 
      api.revokeBadge(id, data),
    onSuccess: (data) => {
      // Invalidar todas as queries relacionadas a crachás para atualização imediata
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badge(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      
      // Invalidar queries de funcionários também
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Invalidar queries de workforce (controle de ponto)
      queryClient.invalidateQueries({ queryKey: ['workforce'] });
      
      // Invalidar queries de dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forçar refetch imediato para todas as listas de crachás
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.stats });
      
      toast.success('Crachá revogado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao revogar crachá');
    },
  });
}

export function useNFCScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ badgeId, location }: { badgeId: string; location?: string }) => 
      api.processScan(badgeId, location),
    onSuccess: (data) => {
      // Invalidar queries de workforce
      queryClient.invalidateQueries({ queryKey: ['workforce'] });
      
      toast.success(data.message || 'Scan processado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao processar scan');
    },
  });
} 

// Hook utilitário para forçar atualizações em tempo real
export function useForceNFCBadgeUpdates() {
  const queryClient = useQueryClient();

  const forceRefreshAll = () => {
    // Invalidar e refetch todas as queries relacionadas a crachás
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badges });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    
    // Invalidar queries relacionadas
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    queryClient.invalidateQueries({ queryKey: ['workforce'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    
    // Forçar refetch imediato
    queryClient.refetchQueries({ queryKey: QUERY_KEYS.badges });
    queryClient.refetchQueries({ queryKey: QUERY_KEYS.stats });
  };

  const forceRefreshBadge = (badgeId: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badge(badgeId) });
    queryClient.refetchQueries({ queryKey: QUERY_KEYS.badge(badgeId) });
  };

  const forceRefreshStats = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    queryClient.refetchQueries({ queryKey: QUERY_KEYS.stats });
  };

  return {
    forceRefreshAll,
    forceRefreshBadge,
    forceRefreshStats,
  };
}

// Hook para monitorar e atualizar automaticamente quando necessário
export function useNFCBadgeRealtimeUpdates() {
  const queryClient = useQueryClient();
  const { forceRefreshAll } = useForceNFCBadgeUpdates();

  // Função para ser chamada quando um evento externo indica que os dados mudaram
  const handleExternalUpdate = (eventType: 'assign' | 'revoke' | 'create' | 'update' | 'delete', badgeId?: string) => {
    console.log(`[NFC Badge Realtime] External update detected: ${eventType}`, badgeId);
    
    // Forçar atualização imediata
    forceRefreshAll();
    
    // Se temos um badge específico, também atualizar ele
    if (badgeId) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badge(badgeId) });
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.badge(badgeId) });
    }
  };

  return {
    handleExternalUpdate,
    forceRefreshAll,
  };
} 