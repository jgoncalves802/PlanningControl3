'use client'

import React from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FunctionFilters as Filters } from '@/lib/useFunctions'

interface FunctionFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onClearFilters: () => void
}

export default function FunctionFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: FunctionFiltersProps) {
  const hasActiveFilters = filters.laborType || filters.search || filters.isActive !== undefined

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined })
  }

  const handleLaborTypeChange = (laborType: string) => {
    onFiltersChange({ 
      ...filters, 
      laborType: laborType === 'all' ? undefined : laborType as 'DIRETO' | 'INDIRETO'
    })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({ 
      ...filters, 
      isActive: status === 'all' ? undefined : status === 'active'
    })
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Campo de busca */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar funções por nome..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Tipo de Mão de Obra */}
          <div className="min-w-[160px]">
            <select
              value={filters.laborType || 'all'}
              onChange={(e) => handleLaborTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            >
              <option value="all">Todos os Tipos</option>
              <option value="DIRETO">Mão de Obra Direta</option>
              <option value="INDIRETO">Mão de Obra Indireta</option>
            </select>
          </div>

          {/* Status */}
          <div className="min-w-[140px]">
            <select
              value={
                filters.isActive === undefined ? 'all' : 
                filters.isActive ? 'active' : 'inactive'
              }
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          {/* Botão Limpar Filtros */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full">
              Busca: "{filters.search}"
              <button
                onClick={() => handleSearchChange('')}
                className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.laborType && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full">
              Tipo: {filters.laborType === 'DIRETO' ? 'Direto' : 'Indireto'}
              <button
                onClick={() => handleLaborTypeChange('all')}
                className="hover:bg-green-200 dark:hover:bg-green-800/50 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.isActive !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs rounded-full">
              Status: {filters.isActive ? 'Ativo' : 'Inativo'}
              <button
                onClick={() => handleStatusChange('all')}
                className="hover:bg-purple-200 dark:hover:bg-purple-800/50 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
} 
