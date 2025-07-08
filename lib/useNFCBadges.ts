import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  NFCBadge, 
  NFCBadgeFilters, 
  NFCBadgeStats, 
  NFCBadgesResponse,
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
  async getBadges(filters: NFCBadgeFilters & { page?: number; limit?: number }): Promise<NFCBadgesResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.employeeId) params.append('employeeId', filters.employeeId);
    if (filters.assignedBy) params.append('assignedBy', filters.assignedBy);

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
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
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
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 2 * 60 * 1000, // Auto-refresh a cada 2 minutos
    refetchOnWindowFocus: false,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfc-badges'] });
    },
  });
}

export function useUpdateNFCBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNFCBadgeData }) => 
      api.updateBadge(id, data),
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badge(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      
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
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      
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
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badge(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      
      // Invalidar queries de funcionários também
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
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
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badges });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badge(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      
      // Invalidar queries de funcionários também
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
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