'use client'

import React, { memo } from 'react'
import { 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Building,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompanyFunction } from '@/lib/useFunctions'

interface FunctionsListProps {
  functions: CompanyFunction[]
  onEdit: (func: CompanyFunction) => void
  onDelete: (func: CompanyFunction) => void
  onView: (func: CompanyFunction) => void
  canManage: boolean
}

const FunctionsList = memo(function FunctionsList({
  functions,
  onEdit,
  onDelete,
  onView,
  canManage
}: FunctionsListProps) {
  
  const getLaborTypeColor = (laborType: 'DIRETO' | 'INDIRETO') => {
    return laborType === 'DIRETO' 
      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }

  if (functions.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
          Nenhuma função encontrada
        </h3>
        <p className="text-gray-500 dark:text-slate-400 mb-6">
          Não há funções cadastradas que correspondam aos filtros aplicados.
        </p>
        {canManage && (
          <Button>
            <Briefcase className="h-4 w-4 mr-2" />
            Adicionar Primeira Função
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-600">
          <tr>
            <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              Função
            </th>
            <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              Tipo de Mão de Obra
            </th>
            <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              Funcionários
            </th>
            <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              Criado em
            </th>
            <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
          {functions.map((func, index) => (
            <tr 
              key={func.id} 
              className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150 ${
                index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/30 dark:bg-slate-800/50'
              }`}
            >
              {/* Nome da Função */}
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {func.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      ID: {func.id.slice(-8)}
                    </p>
                  </div>
                </div>
              </td>

              {/* Tipo de Mão de Obra */}
              <td className="p-4">
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${getLaborTypeColor(func.laborType)}`}>
                  <Building className="h-3 w-3 mr-1" />
                  {func.laborType === 'DIRETO' ? 'Mão de Obra Direta' : 'Mão de Obra Indireta'}
                </span>
              </td>

              {/* Status */}
              <td className="p-4">
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(func.isActive)}`}>
                  {func.isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inativo
                    </>
                  )}
                </span>
              </td>

              {/* Funcionários */}
              <td className="p-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <span className="text-sm text-gray-900 dark:text-slate-100">
                    {func._count?.employees || 0}
                  </span>
                  {(func._count?.employees || 0) > 0 && (
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      funcionário{(func._count?.employees || 0) !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </td>

              {/* Data de Criação */}
              <td className="p-4">
                <span className="text-sm text-gray-900 dark:text-slate-100">
                  {new Date(func.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </td>

              {/* Ações */}
              <td className="p-4">
                <div className="flex items-center space-x-1">
                  {/* Visualizar */}
                  <div className="group relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onView(func)}
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-slate-700 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                      Visualizar detalhes
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-slate-700"></div>
                    </div>
                  </div>

                  {canManage && (
                    <>
                      {/* Editar */}
                      <div className="group relative">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEdit(func)}
                          className="h-8 w-8 p-0 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-all duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-slate-700 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                          Editar função
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-slate-700"></div>
                        </div>
                      </div>

                      {/* Excluir */}
                      <div className="group relative">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDelete(func)}
                          disabled={(func._count?.employees || 0) > 0}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-slate-700 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                          {(func._count?.employees || 0) > 0 
                            ? `Não é possível excluir (${func._count?.employees} funcionário${(func._count?.employees || 0) !== 1 ? 's' : ''} associado${(func._count?.employees || 0) !== 1 ? 's' : ''})`
                            : 'Excluir função'
                          }
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-slate-700"></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

export default FunctionsList 