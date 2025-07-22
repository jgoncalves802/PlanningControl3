'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Briefcase, 
  Building, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Clock,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompanyFunction } from '@/lib/useFunctions'

interface FunctionViewModalProps {
  isOpen: boolean
  onClose: () => void
  function: CompanyFunction | null
  onEdit?: (func: CompanyFunction) => void
  onDelete?: (func: CompanyFunction) => void
  canManage?: boolean
}

export default function FunctionViewModal({
  isOpen,
  onClose,
  function: viewFunction,
  onEdit,
  onDelete,
  canManage = false
}: FunctionViewModalProps) {
  
  if (!isOpen || !viewFunction) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLaborTypeInfo = (laborType: 'DIRETO' | 'INDIRETO') => {
    return laborType === 'DIRETO' 
      ? {
          label: 'Mão de Obra Direta',
          description: 'Função operacional, diretamente envolvida na produção',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
          icon: Building
        }
      : {
          label: 'Mão de Obra Indireta',
          description: 'Função administrativa ou de suporte',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
          icon: Building
        }
  }

  const laborTypeInfo = getLaborTypeInfo(viewFunction.laborType)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                {viewFunction.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Detalhes da função
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManage && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(viewFunction)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Status e Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Status
              </h3>
              <div className="flex items-center gap-3">
                {viewFunction.isActive ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      Função Ativa
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                      Função Inativa
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {viewFunction.isActive 
                  ? 'Disponível para associação com funcionários'
                  : 'Não disponível para novos funcionários'
                }
              </p>
            </div>

            {/* Funcionários Associados */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Funcionários
              </h3>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {viewFunction._count?.employees || 0}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {(viewFunction._count?.employees || 0) === 0 
                  ? 'Nenhum funcionário associado'
                  : `${viewFunction._count?.employees} funcionário${(viewFunction._count?.employees || 0) !== 1 ? 's' : ''} associado${(viewFunction._count?.employees || 0) !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>

          {/* Tipo de Mão de Obra */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              Classificação
            </h3>
            <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
              <div className={`p-2 rounded-lg ${laborTypeInfo.color.split(' ')[0]} ${laborTypeInfo.color.split(' ')[1].replace('text-', 'bg-').replace('800', '100').replace('300', '900/20')}`}>
                <laborTypeInfo.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                  {laborTypeInfo.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {laborTypeInfo.description}
                </p>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full mt-2 ${laborTypeInfo.color}`}>
                  {viewFunction.laborType}
                </span>
              </div>
            </div>
          </div>

          {/* Informações de Auditoria */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              Informações de Auditoria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data de Criação */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-600 dark:text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Criado em
                  </p>
                  <p className="text-sm text-gray-900 dark:text-slate-100">
                    {formatDate(viewFunction.createdAt)}
                  </p>
                </div>
              </div>

              {/* Data de Atualização */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <Clock className="h-4 w-4 text-gray-600 dark:text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Atualizado em
                  </p>
                  <p className="text-sm text-gray-900 dark:text-slate-100">
                    {formatDate(viewFunction.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ID da Função */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              Identificação
            </h3>
            <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                ID da Função
              </p>
              <p className="text-sm font-mono text-gray-900 dark:text-slate-100 break-all">
                {viewFunction.id}
              </p>
            </div>
          </div>

          {/* Ações Perigosas (apenas se pode gerenciar) */}
          {canManage && onDelete && (
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                Zona de Perigo
              </h3>
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                      Excluir Função
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      Esta ação não pode ser desfeita. A função será permanentemente removida do sistema.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(viewFunction)}
                      disabled={(viewFunction._count?.employees || 0) > 0}
                      className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {(viewFunction._count?.employees || 0) > 0 
                        ? `Não é possível excluir (${viewFunction._count?.employees} funcionário${(viewFunction._count?.employees || 0) !== 1 ? 's' : ''} associado${(viewFunction._count?.employees || 0) !== 1 ? 's' : ''})`
                        : 'Excluir Função'
                      }
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </motion.div>
    </div>
  )
} 
