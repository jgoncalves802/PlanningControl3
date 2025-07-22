import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

// Interfaces TypeScript
export interface Contract {
  id: string
  name: string
  code: string
  isActive: boolean
  workdayHours: number
  includesWeekends: boolean
  includesHolidays: boolean
  createdAt: string
  updatedAt: string
  
  // Relacionamentos
  responsibles?: ContractResponsible[]
  functions?: ContractFunction[]
  employees?: Employee[]
  
  // Campos calculados
  employeeCount?: number
  functionCount?: number
}

export interface ContractResponsible {
  contractId: string
  userId: string
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
}

export interface ContractFunction {
  id: string
  contractId: string
  name: string
  isActive: boolean
  employeeCount?: number
}

export interface CreateContractData {
  name: string
  code: string
  workdayHours: number
  includesWeekends?: boolean
  includesHolidays?: boolean
  isActive?: boolean
}

export interface UpdateContractData {
  name?: string
  code?: string
  workdayHours?: number
  includesWeekends?: boolean
  includesHolidays?: boolean
  isActive?: boolean
}

export interface ContractFilters {
  search?: string
  isActive?: boolean
  includesWeekends?: boolean
  includesHolidays?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'code' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ContractsResponse {
  contracts: Contract[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ContractStats {
  totalContracts: number
  activeContracts: number
  inactiveContracts: number
  totalFunctions: number
  totalEmployees: number
  averageWorkdayHours: number
  contractsWithWeekends: number
  contractsWithHolidays: number
  weekendPercentage: number
  holidayPercentage: number
  recentContracts: number
  contractsByWorkdayHours: Array<{
    workdayHours: number
    count: number
  }>
  topContractsByEmployees: Array<{
    id: string
    name: string
    code: string
    employeeCount: number
  }>
  topContractsByFunctions: Array<{
    id: string
    name: string
    code: string
    functionCount: number
  }>
}

// Tipos auxiliares
interface Employee {
  id: string
  name: string
  cpf: string
  isActive: boolean
}

// Hook para listar contratos
export function useContractsQuery(filters: ContractFilters = {}) {
  return useQuery({
    queryKey: ['contracts', filters],
    queryFn: async (): Promise<ContractsResponse> => {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
      if (filters.includesWeekends !== undefined) params.append('includesWeekends', filters.includesWeekends.toString())
      if (filters.includesHolidays !== undefined) params.append('includesHolidays', filters.includesHolidays.toString())
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/contracts?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar contratos')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  })
}

// Hook para buscar contrato específico
export function useContractQuery(contractId: string | null) {
  return useQuery({
    queryKey: ['contract', contractId],
    queryFn: async (): Promise<Contract> => {
      if (!contractId) throw new Error('ID do contrato é obrigatório')
      
      const response = await fetch(`/api/contracts/${contractId}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar contrato')
      }
      
      return response.json()
    },
    enabled: !!contractId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  })
}

// Hook para criar contrato
export function useCreateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateContractData): Promise<Contract> => {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar contrato')
      }

      return response.json()
    },
    onSuccess: (newContract) => {
      // Invalidar cache de contratos
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['contract-stats'] })
      
      toast.success(`Contrato "${newContract.name}" criado com sucesso!`)
    },
    onError: (error) => {
      console.error('Erro ao criar contrato:', error)
      toast.error(error.message || 'Erro ao criar contrato')
    }
  })
}

// Hook para atualizar contrato
export function useUpdateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      contractId, 
      data 
    }: { 
      contractId: string
      data: UpdateContractData 
    }): Promise<Contract> => {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar contrato')
      }

      return response.json()
    },
    onSuccess: (updatedContract, { contractId }) => {
      // Atualizar cache específico do contrato
      queryClient.setQueryData(['contract', contractId], updatedContract)
      
      // Invalidar cache de listagem
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['contract-stats'] })
      
      toast.success(`Contrato "${updatedContract.name}" atualizado com sucesso!`)
    },
    onError: (error) => {
      console.error('Erro ao atualizar contrato:', error)
      toast.error(error.message || 'Erro ao atualizar contrato')
    }
  })
}

// Hook para excluir contrato
export function useDeleteContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contractId: string): Promise<{ message: string }> => {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir contrato')
      }

      return response.json()
    },
    onSuccess: (_, contractId) => {
      // Remover do cache específico
      queryClient.removeQueries({ queryKey: ['contract', contractId] })
      
      // Invalidar cache de listagem
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['contract-stats'] })
      
      toast.success('Contrato excluído com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao excluir contrato:', error)
      toast.error(error.message || 'Erro ao excluir contrato')
    }
  })
}

// Hook para estatísticas de contratos
export function useContractStats() {
  return useQuery({
    queryKey: ['contract-stats'],
    queryFn: async (): Promise<ContractStats> => {
      const response = await fetch('/api/contracts/stats')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar estatísticas')
      }
      
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (estatísticas mudam menos)
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2
  })
} 
