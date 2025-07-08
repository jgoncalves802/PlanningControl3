import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { WorkforceEntry, WorkforceStats, WorkforceFilters, NFCReadData, CreateWorkforceEntryData } from './types/workforce'

// Buscar entradas de efetivo
const fetchWorkforceEntries = async (filters: WorkforceFilters = {}): Promise<WorkforceEntry[]> => {
  const params = new URLSearchParams()
  
  if (filters.contractId) params.append('contractId', filters.contractId)
  if (filters.status && filters.status.length > 0) params.append('status', filters.status.join(','))
  if (filters.search) params.append('search', filters.search)
  if (filters.dateRange?.from) params.append('date', filters.dateRange.from.toISOString().split('T')[0])
  
  const response = await fetch(`/api/workforce?${params}`)
  
  if (!response.ok) {
    throw new Error('Falha ao carregar dados de efetivo')
  }
  
  return response.json()
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
  
  return response.json()
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
export const useWorkforceEntries = (filters: WorkforceFilters = {}) => {
  return useQuery({
    queryKey: ['workforce', 'entries', filters],
    queryFn: () => fetchWorkforceEntries(filters),
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

// Hook para dados em tempo real (combina entradas e estatísticas)
export const useWorkforceRealTime = (filters: WorkforceFilters = {}) => {
  const entriesQuery = useWorkforceEntries(filters)
  const statsQuery = useWorkforceStats(filters)
  
  return {
    entries: entriesQuery.data || [],
    stats: statsQuery.data,
    isLoading: entriesQuery.isLoading || statsQuery.isLoading,
    error: entriesQuery.error || statsQuery.error,
    isRefetching: entriesQuery.isRefetching || statsQuery.isRefetching,
    refetch: () => {
      entriesQuery.refetch()
      statsQuery.refetch()
    }
  }
} 