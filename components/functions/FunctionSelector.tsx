'use client'

import React, { useState } from 'react'
import { ChevronDown, Search, Plus, Briefcase, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFunctionsQuery, CompanyFunction } from '@/lib/useFunctions'

interface FunctionSelectorProps {
  value?: string
  onChange: (functionId: string | null, functionData?: CompanyFunction) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  onCreateNew?: () => void
  showCreateButton?: boolean
}

export default function FunctionSelector({
  value,
  onChange,
  error,
  placeholder = 'Selecione uma função',
  required = false,
  disabled = false,
  onCreateNew,
  showCreateButton = false
}: FunctionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Buscar funções ativas
  const { data: functions = [], isLoading } = useFunctionsQuery({ 
    isActive: true,
    search: searchTerm 
  })

  const selectedFunction = functions.find(func => func.id === value)

  const handleSelect = (func: CompanyFunction | null) => {
    onChange(func?.id || null, func || undefined)
    setIsOpen(false)
    setSearchTerm('')
  }

  const filteredFunctions = functions.filter(func =>
    func.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLaborTypeInfo = (laborType: 'DIRETO' | 'INDIRETO') => {
    return laborType === 'DIRETO' 
      ? {
          label: 'Mão de Obra Direta',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20'
        }
      : {
          label: 'Mão de Obra Indireta',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        }
  }

  return (
    <div className="relative">
      {/* Campo de seleção */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
          error 
            ? 'border-red-300 dark:border-red-600' 
            : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
        } ${
          disabled 
            ? 'bg-gray-100 dark:bg-slate-800 cursor-not-allowed opacity-60' 
            : 'bg-white dark:bg-slate-700'
        } focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedFunction ? (
              <>
                <Briefcase className="h-4 w-4 text-gray-500 dark:text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                    {selectedFunction.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {getLaborTypeInfo(selectedFunction.laborType).label}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                <span className="text-gray-500 dark:text-slate-400 text-sm">
                  {placeholder}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 dark:text-slate-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Cabeçalho com busca */}
          <div className="p-3 border-b border-gray-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar função..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de funções */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  Carregando funções...
                </div>
              </div>
            ) : filteredFunctions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                {searchTerm ? 'Nenhuma função encontrada' : 'Nenhuma função cadastrada'}
              </div>
            ) : (
              <>
                {/* Opção para limpar seleção */}
                <button
                  onClick={() => handleSelect(null)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-100 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4" /> {/* Espaço para alinhamento */}
                    <span className="text-sm text-gray-500 dark:text-slate-400 italic">
                      Nenhuma função selecionada
                    </span>
                  </div>
                </button>

                {/* Lista de funções */}
                {filteredFunctions.map((func) => {
                  const laborInfo = getLaborTypeInfo(func.laborType)
                  return (
                    <button
                      key={func.id}
                      onClick={() => handleSelect(func)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                        value === func.id ? 'bg-primary/10 dark:bg-primary/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${laborInfo.bgColor}`}>
                          <Building className={`h-3 w-3 ${laborInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                            {func.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs ${laborInfo.color}`}>
                              {laborInfo.label}
                            </span>
                            {func._count?.employees && func._count.employees > 0 && (
                              <span className="text-xs text-gray-500 dark:text-slate-400">
                                • {func._count.employees} funcionário{func._count.employees !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </>
            )}
          </div>

          {/* Botão para criar nova função */}
          {showCreateButton && onCreateNew && (
            <div className="p-3 border-t border-gray-200 dark:border-slate-700">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onCreateNew()
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar Nova Função
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Overlay para fechar dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 
