import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { WorkforceEntry, WorkforceStats, WorkforceFilters, NFCReadData, CreateWorkforceEntryData } from './types/workforce'
import { useEffect } from 'react'

// Buscar entradas de efetivo
const fetchWorkforceEntries = async (filters: WorkforceFilters = {}, page = 1, limit = 20): Promise<any> => {
  const params = new URLSearchParams()
  
  if (filters.contractId) params.append('contractId', filters.contractId)
  if (filters.status && filters.status.length > 0) params.append('status', filters.status.join(','))
  if (filters.search) params.append('search', filters.search)
  if (filters.dateRange?.from) params.append('date', filters.dateRange.from.toISOString().split('T')[0])
  params.append('page', String(page))
  params.append('limit', String(limit))
  
  const response = await fetch(`/api/workforce?${params}`)
  
  if (!response.ok) {
    throw new Error('Falha ao carregar dados de efetivo')
  }
  
  // Verificar se a resposta é JSON válido
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Resposta inválida do servidor (não é JSON)')
  }
 
  try {
    return await response.json()
  } catch (error) {
    throw new Error('Erro ao processar resposta do servidor')
  }
}

// Buscar estatísticas de efetivo
const fetchWorkforceStats = async (filters: WorkforceFilters = {}): Promise<WorkforceStats> => {
  const params = new URLSearchParams()
  
  if (filters.contractId) params.append('contractId', filters.contractId)
  if (filters.dateRange?.from) params.append('date', filters.dateRange.from.toISOString().split('T')[0])
  
  const response = await fetch(`/api/workforce/stats?${params}`)
  
  if (!response.ok) {
    throw new Error('Falha ao carregar estatísticas de efetivo')
  }
  
  // Verificar se a resposta é JSON válido
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Resposta inválida do servidor (não é JSON)')
  }
 
  try {
    return await response.json()
  } catch (error) {
    throw new Error('Erro ao processar resposta do servidor')
  }
}

// Criar entrada de efetivo
const createWorkforceEntry = async (data: CreateWorkforceEntryData): Promise<WorkforceEntry> => {
  const response = await fetch('/api/workforce', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Falha ao criar registro de efetivo')
  }
  
  return response.json()
}

// Processar leitura NFC
const processNFCRead = async (data: NFCReadData): Promise<WorkforceEntry> => {
  const response = await fetch('/api/workforce/nfc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Falha ao processar leitura NFC')
  }
  
  return response.json()
}

// Hook para buscar entradas de efetivo
export const useWorkforceEntries = (filters: WorkforceFilters = {}, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['workforce', 'entries', filters, page, limit],
    queryFn: () => fetchWorkforceEntries(filters, page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true, // Refetch quando volta para a aba
    refetchInterval: 60 * 1000, // Atualizar a cada minuto
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Hook para buscar estatísticas de efetivo
export const useWorkforceStats = (filters: WorkforceFilters = {}) => {
  return useQuery({
    queryKey: ['workforce', 'stats', filters],
    queryFn: () => fetchWorkforceStats(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Atualizar a cada minuto
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Hook para criar entrada de efetivo
export const useCreateWorkforceEntry = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createWorkforceEntry,
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['workforce'] })
      
      toast.success('Registro de efetivo criado com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para processar leitura NFC
export const useProcessNFC = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: processNFCRead,
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['workforce'] })
      
      // Mostrar notificação personalizada baseada na ação
      if (data.action === 'check_in') {
        toast.success(
          `${data.employeeName} - Check-in realizado${data.isLate ? ' (ATRASADO)' : ''}`,
          { 
            duration: 4000,
            icon: data.isLate ? '⚠️' : '✅'
          }
        )
      } else {
        toast.success(
          `${data.employeeName} - Check-out realizado (${data.hoursWorked?.toFixed(1)}h trabalhadas)`,
          { 
            duration: 4000,
            icon: '🏠'
          }
        )
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro NFC: ${error.message}`, {
        duration: 5000,
        icon: '❌'
      })
    },
  })
}

// Hook para SSE de workforce
export function useWorkforceSSE(refetch: () => void) {
  useEffect(() => {
    const eventSource = new EventSource('/api/workforce/sse')
    eventSource.addEventListener('update', () => {
      refetch()
    })
    return () => {
      eventSource.close()
    }
  }, [refetch])
}

// Hook para dados em tempo real (combina entradas e estatísticas)
export const useWorkforceRealTime = (filters: WorkforceFilters = {}, page = 1, limit = 20) => {
  const entriesQuery = useWorkforceEntries(filters, page, limit)
  const statsQuery = useWorkforceStats(filters)

  // Integrar SSE para atualização instantânea
  useWorkforceSSE(() => {
    entriesQuery.refetch()
    statsQuery.refetch()
  })

  // Adaptar para novo formato paginado e agrupado
  const paginated = entriesQuery.data || { entries: [], contractGroups: [], total: 0, page: 1, totalPages: 1, limit }

  return {
    entries: paginated, // Retorna o objeto completo com contractGroups
    stats: statsQuery.data,
    isLoading: entriesQuery.isLoading || statsQuery.isLoading,
    error: entriesQuery.error || statsQuery.error,
    refetch: () => {
      entriesQuery.refetch()
      statsQuery.refetch()
    },
    // Manter compatibilidade com formato antigo
    total: paginated.total,
    page: paginated.page,
    totalPages: paginated.totalPages,
    limit: paginated.limit,
  }
} 