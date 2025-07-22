import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useMemo } from 'react'

// Tipos
export interface CompanyFunction {
  id: string
  name: string
  laborType: 'DIRETO' | 'INDIRETO'
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    employees: number
  }
}

export interface CreateFunctionData {
  name: string
  laborType: 'DIRETO' | 'INDIRETO'
}

export interface UpdateFunctionData {
  name?: string
  laborType?: 'DIRETO' | 'INDIRETO'
  isActive?: boolean
}

export interface FunctionFilters {
  laborType?: 'DIRETO' | 'INDIRETO'
  search?: string
  isActive?: boolean
}

// Serviços da API
const functionsService = {
  // Listar funções
  async getFunctions(filters?: FunctionFilters): Promise<CompanyFunction[]> {
    const params = new URLSearchParams()
    
    if (filters?.laborType) params.append('laborType', filters.laborType)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    
    const url = `/api/functions${params.toString() ? `?${params.toString()}` : ''}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Erro ao buscar funções')
    }
    return response.json()
  },

  // Buscar função por ID
  async getFunction(id: string): Promise<CompanyFunction> {
    const response = await fetch(`/api/functions/${id}`)
    if (!response.ok) {
      throw new Error('Erro ao buscar função')
    }
    return response.json()
  },

  // Criar função
  async createFunction(data: CreateFunctionData): Promise<CompanyFunction> {
    const response = await fetch('/api/functions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar função')
    }
    
    return response.json()
  },

  // Atualizar função
  async updateFunction(id: string, data: UpdateFunctionData): Promise<CompanyFunction> {
    const response = await fetch(`/api/functions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao atualizar função')
    }
    
    return response.json()
  },

  // Excluir função
  async deleteFunction(id: string): Promise<void> {
    const response = await fetch(`/api/functions/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao excluir função')
    }
  },
}

// Hooks

// Hook para listar funções
export function useFunctionsQuery(filters?: FunctionFilters) {
  return useQuery({
    queryKey: ['functions', filters],
    queryFn: () => functionsService.getFunctions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
    refetchOnWindowFocus: false, // Evitar refetch desnecessários
    retry: 3, // Tentar novamente em caso de erro
  })
}

// Hook para listar funções com contagem atualizada em tempo real
export function useFunctionsWithRealTimeCount(filters?: FunctionFilters) {
  const { data: functions = [], isLoading, ...queryResult } = useFunctionsQuery(filters)
  const queryClient = useQueryClient()
  
  // Buscar dados dos funcionários do cache
  const employeesData = queryClient.getQueryData(['employees']) as any
  const employees = employeesData?.employees || []
  
  // Calcular contagens em tempo real baseado nos funcionários carregados
  const functionsWithUpdatedCount = useMemo(() => {
    // Se ainda estiver carregando ou não tiver funções, retornar array vazio
    if (isLoading || !functions || functions.length === 0) {
      return []
    }
    
    return functions.map(func => {
      // Contar funcionários que têm esta função atribuída
      const employeeCount = employees.filter((emp: any) => emp.companyFunctionId === func.id).length
      
      return {
        ...func,
        _count: {
          employees: employeeCount
        }
      }
    })
  }, [functions, employees, isLoading])
  
  return {
    ...queryResult,
    isLoading,
    data: functionsWithUpdatedCount
  }
}

// Hook para buscar função por ID
export function useFunctionQuery(id: string) {
  return useQuery({
    queryKey: ['functions', id],
    queryFn: () => functionsService.getFunction(id),
    enabled: !!id,
  })
}

// Hook para criar função
export function useCreateFunction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: functionsService.createFunction,
    onSuccess: (data) => {
      // Invalidar cache das funções
      queryClient.invalidateQueries({ queryKey: ['functions'] })
      toast.success('Função criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para atualizar função
export function useUpdateFunction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFunctionData }) =>
      functionsService.updateFunction(id, data),
    onSuccess: (data, variables) => {
      // Invalidar cache das funções
      queryClient.invalidateQueries({ queryKey: ['functions'] })
      // Atualizar cache da função específica
      queryClient.setQueryData(['functions', variables.id], data)
      toast.success('Função atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para excluir função
export function useDeleteFunction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: functionsService.deleteFunction,
    onSuccess: () => {
      // Invalidar cache das funções
      queryClient.invalidateQueries({ queryKey: ['functions'] })
      toast.success('Função excluída com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para estatísticas das funções com contagem em tempo real
export function useFunctionStats() {
  const { data: functions = [] } = useFunctionsWithRealTimeCount()
  
  const stats = {
    total: functions.length,
    active: functions.filter(f => f.isActive).length,
    inactive: functions.filter(f => !f.isActive).length,
    direto: functions.filter(f => f.laborType === 'DIRETO').length,
    indireto: functions.filter(f => f.laborType === 'INDIRETO').length,
    withEmployees: functions.filter(f => (f._count?.employees || 0) > 0).length,
    totalEmployees: functions.reduce((acc, f) => acc + (f._count?.employees || 0), 0),
  }
  
  return stats
} 
