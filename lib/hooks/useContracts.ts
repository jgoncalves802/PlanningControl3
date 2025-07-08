import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { 
  Contract, 
  CreateContractData, 
  UpdateContractData, 
  ContractFilters,
  ContractFunction,
  CreateContractFunctionData 
} from '@/lib/types/contracts'

// Chaves de query para cache
export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (filters: ContractFilters) => [...contractKeys.lists(), filters] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
  functions: (contractId: string) => [...contractKeys.detail(contractId), 'functions'] as const,
}

// Serviços de API
const contractsAPI = {
  // Listar contratos
  getContracts: async (filters: ContractFilters = {}) => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })
    
    const response = await fetch(`/api/contracts?${params}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao buscar contratos')
    }
    
    return response.json()
  },

  // Buscar contrato por ID
  getContract: async (id: string): Promise<Contract> => {
    const response = await fetch(`/api/contracts/${id}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao buscar contrato')
    }
    
    return response.json()
  },

  // Criar contrato
  createContract: async (data: CreateContractData): Promise<Contract> => {
    const response = await fetch('/api/contracts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar contrato')
    }
    
    return response.json()
  },

  // Atualizar contrato
  updateContract: async ({ id, data }: { id: string; data: UpdateContractData }): Promise<Contract> => {
    const response = await fetch(`/api/contracts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao atualizar contrato')
    }
    
    return response.json()
  },

  // Excluir contrato
  deleteContract: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`/api/contracts/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao excluir contrato')
    }
    
    return response.json()
  },

  // Buscar funções do contrato
  getContractFunctions: async (contractId: string): Promise<ContractFunction[]> => {
    const response = await fetch(`/api/contracts/${contractId}/functions`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao buscar funções do contrato')
    }
    
    return response.json()
  },

  // Criar função do contrato
  createContractFunction: async ({ contractId, data }: { contractId: string; data: CreateContractFunctionData }): Promise<ContractFunction> => {
    const response = await fetch(`/api/contracts/${contractId}/functions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar função do contrato')
    }
    
    return response.json()
  }
}

// Hooks React Query

// Hook para listar contratos
export const useContractsQuery = (filters: ContractFilters = {}) => {
  return useQuery({
    queryKey: contractKeys.list(filters),
    queryFn: () => contractsAPI.getContracts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  })
}

// Hook para buscar contrato por ID
export const useContractQuery = (id: string) => {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => contractsAPI.getContract(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// Hook para criar contrato
export const useCreateContract = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: contractsAPI.createContract,
    onSuccess: (newContract) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() })
      
      // Adicionar ao cache de detalhes
      queryClient.setQueryData(contractKeys.detail(newContract.id), newContract)
      
      toast.success('Contrato criado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar contrato')
    },
  })
}

// Hook para atualizar contrato
export const useUpdateContract = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: contractsAPI.updateContract,
    onSuccess: (updatedContract) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() })
      
      // Atualizar cache de detalhes
      queryClient.setQueryData(contractKeys.detail(updatedContract.id), updatedContract)
      
      toast.success('Contrato atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar contrato')
    },
  })
}

// Hook para excluir contrato
export const useDeleteContract = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: contractsAPI.deleteContract,
    onSuccess: (_, contractId) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() })
      
      // Remover do cache de detalhes
      queryClient.removeQueries({ queryKey: contractKeys.detail(contractId) })
      
      toast.success('Contrato desativado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao desativar contrato')
    },
  })
}

// Hook para buscar funções do contrato
export const useContractFunctionsQuery = (contractId: string) => {
  return useQuery({
    queryKey: contractKeys.functions(contractId),
    queryFn: () => contractsAPI.getContractFunctions(contractId),
    enabled: !!contractId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// Hook para criar função do contrato
export const useCreateContractFunction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: contractsAPI.createContractFunction,
    onSuccess: (newFunction, { contractId }) => {
      // Invalidar cache de funções do contrato
      queryClient.invalidateQueries({ queryKey: contractKeys.functions(contractId) })
      
      // Invalidar cache do contrato para atualizar contagens
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(contractId) })
      
      toast.success('Função criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar função')
    },
  })
}

// Hook para estatísticas de contratos
export const useContractStatsQuery = () => {
  return useQuery({
    queryKey: [...contractKeys.all, 'stats'],
    queryFn: async () => {
      const { contracts } = await contractsAPI.getContracts({ limit: 1000 })
      
      return {
        total: contracts.length,
        active: contracts.filter((c: Contract) => c.isActive).length,
        inactive: contracts.filter((c: Contract) => !c.isActive).length,
        totalEmployees: contracts.reduce((acc: number, c: Contract) => acc + (c.employeeCount || 0), 0),
        totalFunctions: contracts.reduce((acc: number, c: Contract) => acc + (c.functions?.length || 0), 0),
        totalValue: contracts.reduce((acc: number, c: Contract) => acc + (c.totalValue || 0), 0),
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  })
} 