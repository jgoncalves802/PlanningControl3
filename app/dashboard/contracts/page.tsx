'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Search, 
  Plus, 
  MoreHorizontal,
  Eye,
  Edit,
  Users,
  Clock,
  Calendar,
  Building,
  Shield,
  Settings,
  Trash2,
  Save,
  X,
  Check,
  Download,
  Filter,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Building2,
  UserCheck,
  AlertTriangle,
  Copy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import { 
  getCurrentUser, 
  getUserPermissions, 
  validateUserAccess,
  User,
  UserRole
} from '@/lib/auth'
import { 
  useContractsQuery, 
  useContractStatsQuery, 
  useCreateContract, 
  useUpdateContract, 
  useDeleteContract
} from '@/lib/hooks/useContracts'
import { Contract, CreateContractData, UpdateContractData, ContractFilters } from '@/lib/types/contracts'
import { toast } from 'react-hot-toast'

// Configuração das colunas disponíveis baseada na imagem
interface ColumnConfig {
  key: string
  label: string
  enabled: boolean
  width?: string
  category: 'suggested' | 'all'
}

const defaultColumns: ColumnConfig[] = [
  // Colunas sugeridas (baseadas na imagem)
  { key: 'name', label: 'Nome do Contrato', enabled: true, width: '200px', category: 'suggested' },
  { key: 'code', label: 'Código', enabled: true, width: '120px', category: 'suggested' },
  { key: 'status', label: 'Status', enabled: true, width: '100px', category: 'suggested' },
  { key: 'employees', label: 'Funcionários', enabled: true, width: '100px', category: 'suggested' },
  
  // Todas as colunas
  { key: 'functions', label: 'Funções', enabled: false, width: '80px', category: 'all' },
  { key: 'workdayHours', label: 'Horas/Dia', enabled: false, width: '90px', category: 'all' },
  { key: 'includesWeekends', label: 'Inclui FDS', enabled: false, width: '90px', category: 'all' },
  { key: 'includesHolidays', label: 'Inclui Feriados', enabled: false, width: '110px', category: 'all' },
  { key: 'createdAt', label: 'Data Criação', enabled: false, width: '110px', category: 'all' },
  { key: 'updatedAt', label: 'Última Atualização', enabled: false, width: '130px', category: 'all' }
]

export default function ContractsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  
  // Estados para filtros e busca
  const [filters, setFilters] = useState<ContractFilters>({
    page: 1,
    limit: 20,
    search: '',
    isActive: undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  })
  
  // Estados para interface
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedContractData, setSelectedContractData] = useState<Contract | null>(null)
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])
  
  // Estados para formulários
  const [newContract, setNewContract] = useState<CreateContractData>({
    name: '',
    code: '',
    workdayHours: 8,
    includesWeekends: false,
    includesHolidays: false,
    isActive: true
  })

  // Hooks para APIs
  const { data: contractsData, isLoading: contractsLoading, error: contractsError, refetch } = useContractsQuery(filters)
  const { data: stats, isLoading: statsLoading } = useContractStatsQuery()
  const createContractMutation = useCreateContract()
  const updateContractMutation = useUpdateContract()
  const deleteContractMutation = useDeleteContract()

  // Debug: forçar refetch se não houver dados
  useEffect(() => {
    if (!contractsLoading && !contractsData && !contractsError) {
      console.log('Forçando refetch dos contratos...')
      refetch()
    }
  }, [contractsLoading, contractsData, contractsError, refetch])

  // Inicializar usuário e permissões
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)

    // Carregar configuração de colunas salva
    const savedColumns = localStorage.getItem('contract-columns')
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns))
      } catch (error) {
        console.error('Erro ao carregar configuração de colunas:', error)
      }
    }
  }, [])

  // Atualizar filtros
  const updateFilters = (newFilters: Partial<ContractFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleColumnToggle = (columnKey: string) => {
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, enabled: !col.enabled } : col
    )
    setColumns(updatedColumns)
    localStorage.setItem('contract-columns', JSON.stringify(updatedColumns))
  }

  const handleSelectContract = (contractId: string) => {
    setSelectedContracts(prev => 
      prev.includes(contractId) 
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    )
  }

  const handleSelectAll = () => {
    const contracts = contractsData?.contracts || []
    setSelectedContracts(
      selectedContracts.length === contracts.length 
        ? [] 
        : contracts.map(c => c.id)
    )
  }

  const handleAddContract = async () => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    try {
      await createContractMutation.mutateAsync(newContract)
      setNewContract({
        name: '',
        code: '',
        workdayHours: 8,
        includesWeekends: false,
        includesHolidays: false,
        isActive: true
      })
      setShowAddModal(false)
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleEditContract = async () => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES') || !selectedContractData) return
    
    try {
      await updateContractMutation.mutateAsync({
        id: selectedContractData.id,
        data: {
          name: selectedContractData.name,
          code: selectedContractData.code,
          workdayHours: selectedContractData.workdayHours,
          includesWeekends: selectedContractData.includesWeekends,
          includesHolidays: selectedContractData.includesHolidays,
          isActive: selectedContractData.isActive
        }
      })
      setShowEditModal(false)
      setSelectedContractData(null)
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleDeleteContract = async (contractId: string) => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    if (confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await deleteContractMutation.mutateAsync(contractId)
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  }

  const handleBulkDelete = async () => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    if (confirm(`Tem certeza que deseja excluir ${selectedContracts.length} contratos selecionados?`)) {
      try {
        await Promise.all(
          selectedContracts.map(contractId => 
            deleteContractMutation.mutateAsync(contractId)
          )
        )
        setSelectedContracts([])
      } catch (error) {
        // Erros já tratados no hook
      }
    }
  }

  const handleDuplicateContract = async (contract: Contract) => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    try {
      await createContractMutation.mutateAsync({
        name: `${contract.name} (Cópia)`,
        code: `${contract.code}-COPY`,
        workdayHours: contract.workdayHours,
        includesWeekends: contract.includesWeekends,
        includesHolidays: contract.includesHolidays,
        isActive: contract.isActive
      })
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const exportData = () => {
    const contracts = contractsData?.contracts || []
    const dataToExport = contracts.map(contract => ({
      nome: contract.name,
      codigo: contract.code,
      status: contract.isActive ? 'Ativo' : 'Inativo',
      horasDia: contract.workdayHours,
      incluiFds: contract.includesWeekends ? 'Sim' : 'Não',
      incluiFeriados: contract.includesHolidays ? 'Sim' : 'Não',
      funcionarios: contract.employeeCount || 0,
      funcoes: contract.functions?.length || 0,
      criadoEm: formatDate(new Date(contract.createdAt))
    }))
    
    console.log('Exportando dados:', dataToExport)
    toast.success('Dados exportados com sucesso!')
    // TODO: Implementar download real do arquivo
  }

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.TENANT_ADMIN: return 'Admin Geral'
      case UserRole.CONTRACT_MANAGER: return 'Gerente de Contrato'
      case UserRole.HR: return 'Recursos Humanos'
      case UserRole.PLANNING: return 'Planejamento'
      case UserRole.SAFETY: return 'Segurança'
      case UserRole.SUPERVISOR: return 'Supervisor'
      case UserRole.OPERATOR: return 'Operador'
      default: return role
    }
  }

  const enabledColumns = columns.filter(col => col.enabled)

  const renderCellContent = (contract: Contract, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{contract.name}</span>
      case 'code':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.code}</span>
      case 'status':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            contract.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
          }`}>
            {contract.isActive ? 'Ativo' : 'Inativo'}
          </span>
        )
      case 'employees':
        return (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <span className="text-sm text-gray-900 dark:text-slate-100">{contract.employeeCount || 0}</span>
          </div>
        )
      case 'functions':
        return (
          <div className="flex items-center gap-1">
            <UserCheck className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <span className="text-sm text-gray-900 dark:text-slate-100">{contract.functions?.length || 0}</span>
          </div>
        )
      case 'workdayHours':
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <span className="text-sm text-gray-900 dark:text-slate-100">{contract.workdayHours}h</span>
          </div>
        )
      case 'includesWeekends':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            contract.includesWeekends ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
          }`}>
            {contract.includesWeekends ? 'Sim' : 'Não'}
          </span>
        )
      case 'includesHolidays':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            contract.includesHolidays ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
          }`}>
            {contract.includesHolidays ? 'Sim' : 'Não'}
          </span>
        )
      case 'createdAt':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{formatDate(new Date(contract.createdAt))}</span>
      case 'updatedAt':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{formatDate(new Date(contract.updatedAt))}</span>
      default:
        return <span className="text-sm text-gray-500 dark:text-slate-400">-</span>
    }
  }

  // Loading state
  if (!currentUser || !userPermissions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-slate-400">Carregando permissões...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (contractsError) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
            Erro ao carregar contratos
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            {contractsError.message || 'Ocorreu um erro inesperado'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  const contracts = contractsData?.contracts || []
  const pagination = contractsData?.pagination

  return (
    <div className="p-8">
      <div className="space-y-6">
        {/* Header com Informações de Permissão */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Contratos</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-600 dark:text-slate-400">Gerencie seus contratos e funções de trabalho</p>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  {getRoleDisplayName(currentUser.role)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowColumnConfig(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Colunas
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
              <Button size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Contrato
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { 
                label: 'Total Contratos', 
                value: stats.total, 
                icon: FileText,
                color: 'blue' 
              },
              { 
                label: 'Contratos Ativos', 
                value: stats.active,
                icon: Building,
                color: 'green' 
              },
              { 
                label: 'Total Funções', 
                value: stats.totalFunctions,
                icon: Users,
                color: 'purple' 
              },
              { 
                label: 'Total Funcionários', 
                value: stats.totalEmployees,
                icon: Users,
                color: 'orange' 
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                        <stat.icon className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : null}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar contratos por nome ou código..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
                  onChange={(e) => {
                    const value = e.target.value
                    updateFilters({ 
                      isActive: value === 'all' ? undefined : value === 'active' 
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Mais Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contratos ({contracts.length})
                </CardTitle>
                {selectedContracts.length > 0 && validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      {selectedContracts.length} selecionados
                    </span>
                    <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Selecionados
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {contractsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : contracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
                    Nenhum contrato encontrado
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 mb-4">
                    {filters.search || filters.isActive !== undefined
                      ? 'Tente ajustar os filtros ou criar um novo contrato.'
                      : 'Comece criando seu primeiro contrato.'}
                  </p>
                  {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                    <Button onClick={() => setShowAddModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Contrato
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedContracts.length === contracts.length}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 dark:border-slate-600"
                          />
                        </th>
                        {enabledColumns.map(column => (
                          <th key={column.key} className="text-left py-3 px-4 font-medium text-gray-900 dark:text-slate-100">
                            {column.label}
                          </th>
                        ))}
                        <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-slate-100">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.map((contract) => (
                        <tr key={contract.id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedContracts.includes(contract.id)}
                              onChange={() => handleSelectContract(contract.id)}
                              className="rounded border-gray-300 dark:border-slate-600"
                            />
                          </td>
                          {enabledColumns.map(column => (
                            <td key={column.key} className="py-3 px-4">
                              {renderCellContent(contract, column.key)}
                            </td>
                          ))}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedContractData(contract)
                                setShowViewModal(true)
                              }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedContractData(contract)
                                    setShowEditModal(true)
                                  }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDuplicateContract(contract)}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteContract(contract.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Paginação */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} contratos
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => updateFilters({ page: pagination.page - 1 })}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      Página {pagination.page} de {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => updateFilters({ page: pagination.page + 1 })}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modals - TODO: Implementar modais de criação, edição e visualização */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Novo Contrato</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={newContract.name}
                  onChange={(e) => setNewContract(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  placeholder="Nome do contrato"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input
                  type="text"
                  value={newContract.code}
                  onChange={(e) => setNewContract(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  placeholder="CONT-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horas por dia</label>
                <input
                  type="number"
                  value={newContract.workdayHours}
                  onChange={(e) => setNewContract(prev => ({ ...prev, workdayHours: parseFloat(e.target.value) || 8 }))}
                  className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  min="1"
                  max="24"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newContract.includesWeekends}
                    onChange={(e) => setNewContract(prev => ({ ...prev, includesWeekends: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-slate-600"
                  />
                  Inclui fins de semana
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newContract.includesHolidays}
                    onChange={(e) => setNewContract(prev => ({ ...prev, includesHolidays: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-slate-600"
                  />
                  Inclui feriados
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddContract}
                disabled={!newContract.name || !newContract.code || createContractMutation.isPending}
              >
                {createContractMutation.isPending ? 'Criando...' : 'Criar Contrato'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}