'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Download, Settings, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import FunctionStats from './FunctionStats'
import FunctionFilters from './FunctionFilters'
import FunctionsList from './FunctionsList'
import FunctionModal from './FunctionModal'
import FunctionViewModal from './FunctionViewModal'
import FunctionImportDialog from './FunctionImportDialog'
import { 
  useFunctionsWithRealTimeCount, 
  useCreateFunction, 
  useUpdateFunction, 
  useDeleteFunction,
  CompanyFunction,
  FunctionFilters as Filters
} from '@/lib/useFunctions'
import { validateUserAccess, User } from '@/lib/auth-client'

interface FunctionsTabProps {
  currentUser: User
}

export default function FunctionsTab({ currentUser }: FunctionsTabProps) {
  // Estados para filtros
  const [filters, setFilters] = useState<Filters>({})
  
  // Estados para modais
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedFunction, setSelectedFunction] = useState<CompanyFunction | null>(null)

  // Permissões
  const canManage = validateUserAccess(currentUser, 'MANAGE_EMPLOYEES')

  // Queries e mutations
  const { 
    data: functions = [], 
    isLoading, 
    isError, 
    refetch 
  } = useFunctionsWithRealTimeCount(filters)
  
  const createMutation = useCreateFunction()
  const updateMutation = useUpdateFunction()
  const deleteMutation = useDeleteFunction()

  // Handlers
  const handleClearFilters = () => {
    setFilters({})
  }

  const handleCreateFunction = async (data: any) => {
    await createMutation.mutateAsync(data)
  }

  const handleUpdateFunction = async (data: any) => {
    if (!selectedFunction) return
    await updateMutation.mutateAsync({ id: selectedFunction.id, data })
  }

  const handleDeleteFunction = (func: CompanyFunction) => {
    if (!canManage) return
    
    if (confirm(`Tem certeza que deseja excluir a função "${func.name}"?`)) {
      deleteMutation.mutate(func.id)
    }
  }

  const handleEditFunction = (func: CompanyFunction) => {
    setSelectedFunction(func)
    setShowEditModal(true)
  }

  const handleViewFunction = (func: CompanyFunction) => {
    setSelectedFunction(func)
    setShowViewModal(true)
  }

  const handleImportComplete = (result: any) => {
    if (result.success > 0) {
      refetch()
    }
  }

  const handleExportData = () => {
    // Preparar dados para exportação
    const exportData = functions.map(func => ({
      'Nome': func.name,
      'Tipo de Mão de Obra': func.laborType === 'DIRETO' ? 'Mão de Obra Direta' : 'Mão de Obra Indireta',
      'Status': func.isActive ? 'Ativo' : 'Inativo',
      'Funcionários Associados': func._count?.employees || 0,
      'Criado em': new Date(func.createdAt).toLocaleDateString('pt-BR'),
      'Atualizado em': new Date(func.updatedAt).toLocaleDateString('pt-BR')
    }))

    // Converter para CSV
    const headers = Object.keys(exportData[0] || {})
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `funcoes-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Dados exportados com sucesso!')
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          Erro ao carregar funções
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <FunctionStats />

      {/* Filtros */}
      <FunctionFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Lista de Funções */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Funções Cadastradas ({functions.length})
              </CardTitle>
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  Carregando...
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <FunctionsList
              functions={functions}
              onEdit={handleEditFunction}
              onDelete={handleDeleteFunction}
              onView={handleViewFunction}
              canManage={canManage}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal de Criação */}
      <FunctionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateFunction}
        isLoading={createMutation.isPending}
      />

      {/* Modal de Edição */}
      <FunctionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedFunction(null)
        }}
        onSubmit={handleUpdateFunction}
        function={selectedFunction}
        isLoading={updateMutation.isPending}
      />

      {/* Modal de Visualização */}
      <FunctionViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedFunction(null)
        }}
        function={selectedFunction}
        onEdit={handleEditFunction}
        onDelete={handleDeleteFunction}
        canManage={canManage}
      />

      {/* Modal de Importação */}
      <FunctionImportDialog
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  )
} 
