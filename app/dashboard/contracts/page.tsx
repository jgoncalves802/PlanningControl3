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
import { mockContracts, Contract, mockEmployees } from '@/lib/mock-data'
import { formatDate, formatCurrency } from '@/lib/utils'
import { 
  getCurrentUser, 
  getUserPermissions, 
  getAccessibleContracts, 
  validateUserAccess,
  User,
  UserRole
} from '@/lib/auth'

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
  { key: 'escopo', label: 'Escopo', enabled: true, width: '150px', category: 'suggested' },
  { key: 'numeroContrato', label: 'Nº Contrato', enabled: true, width: '120px', category: 'suggested' },
  { key: 'cliente', label: 'Cliente', enabled: true, width: '150px', category: 'suggested' },
  { key: 'status', label: 'Status', enabled: true, width: '100px', category: 'suggested' },
  
  // Todas as colunas
  { key: 'gestorCliente', label: 'Gestor Cliente', enabled: true, width: '140px', category: 'all' },
  { key: 'gestorFornecedor', label: 'Gestor Fornecedor', enabled: true, width: '140px', category: 'all' },
  { key: 'projetoSankhya', label: 'Projeto Sankhya', enabled: true, width: '130px', category: 'all' },
  { key: 'prazoExecucao', label: 'Prazo Execução', enabled: false, width: '120px', category: 'all' },
  { key: 'valor', label: 'Valor', enabled: false, width: '120px', category: 'all' },
  { key: 'dataInicio', label: 'Data Início', enabled: false, width: '110px', category: 'all' },
  { key: 'dataFim', label: 'Data Fim', enabled: false, width: '110px', category: 'all' },
  { key: 'horasDia', label: 'Horas/Dia', enabled: false, width: '90px', category: 'all' },
  { key: 'funcionarios', label: 'Funcionários', enabled: false, width: '100px', category: 'all' },
  { key: 'funcoes', label: 'Funções', enabled: false, width: '80px', category: 'all' },
  { key: 'contratada', label: 'Empresa Contratada', enabled: false, width: '150px', category: 'all' },
  { key: 'cnpjContratada', label: 'CNPJ Contratada', enabled: false, width: '130px', category: 'all' },
  { key: 'sistemaContratada', label: 'Sistema Contratada', enabled: false, width: '140px', category: 'all' },
  { key: 'incluiFds', label: 'Inclui FDS', enabled: false, width: '90px', category: 'all' },
  { key: 'incluiFeriados', label: 'Inclui Feriados', enabled: false, width: '110px', category: 'all' },
  { key: 'prazoAso', label: 'Prazo ASO (dias)', enabled: false, width: '120px', category: 'all' }
]

export default function ContractsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedContractData, setSelectedContractData] = useState<Contract | null>(null)
  const [newContract, setNewContract] = useState<Partial<Contract>>({})
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])

  // Inicializar usuário e permissões
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)
    
    // Filtrar contratos baseado nas permissões
    const accessibleContracts = getAccessibleContracts(user, mockContracts)
    setContracts(accessibleContracts)

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

  const filteredContracts = contracts.filter(contract => 
    (contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     contract.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || (statusFilter === 'active' ? contract.isActive : !contract.isActive))
  )

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
    setSelectedContracts(
      selectedContracts.length === filteredContracts.length 
        ? [] 
        : filteredContracts.map(c => c.id)
    )
  }

  const handleAddContract = () => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    const contract: Contract = {
      id: `contract-${Date.now()}`,
      name: newContract.name || '',
      code: newContract.code || '',
      isActive: newContract.isActive ?? true,
      workdayHours: newContract.workdayHours || 8,
      includesWeekends: newContract.includesWeekends || false,
      includesHolidays: newContract.includesHolidays || false,
      functions: [],
      employeeCount: 0,
      createdAt: new Date(),
      contractorCompany: newContract.contractorCompany || '',
      contractorCNPJ: newContract.contractorCNPJ || '',
      contractorSystem: newContract.contractorSystem || '',
      requiredTrainings: [],
      asoExpirationDays: newContract.asoExpirationDays || 15,
      // Novos campos
      scope: newContract.scope || '',
      client: newContract.client || '',
      clientManager: newContract.clientManager || '',
      supplierManager: newContract.supplierManager || '',
      sankhyaProject: newContract.sankhyaProject || '',
      executionDeadline: newContract.executionDeadline,
      totalValue: newContract.totalValue || 0,
      startDate: newContract.startDate,
      endDate: newContract.endDate
    }
    
    setContracts(prev => [...prev, contract])
    setNewContract({})
    setShowAddModal(false)
  }

  const handleEditContract = () => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES') || !selectedContractData) return
    
    setContracts(prev => prev.map(contract => 
      contract.id === selectedContractData.id ? { ...selectedContractData } : contract
    ))
    setShowEditModal(false)
    setSelectedContractData(null)
  }

  const handleDeleteContract = (contractId: string) => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    if (confirm('Tem certeza que deseja excluir este contrato?')) {
      setContracts(prev => prev.filter(contract => contract.id !== contractId))
    }
  }

  const handleBulkDelete = () => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    if (confirm(`Tem certeza que deseja excluir ${selectedContracts.length} contratos selecionados?`)) {
      setContracts(prev => prev.filter(contract => !selectedContracts.includes(contract.id)))
      setSelectedContracts([])
    }
  }

  const handleDuplicateContract = (contract: Contract) => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    const duplicatedContract: Contract = {
      ...contract,
      id: `contract-${Date.now()}`,
      name: `${contract.name} (Cópia)`,
      code: `${contract.code}-COPY`,
      createdAt: new Date(),
      employeeCount: 0
    }
    
    setContracts(prev => [...prev, duplicatedContract])
  }

  const exportData = () => {
    const dataToExport = filteredContracts.map(contract => ({
      nome: contract.name,
      codigo: contract.code,
      escopo: contract.scope,
      cliente: contract.client,
      status: contract.isActive ? 'Ativo' : 'Inativo',
      gestorCliente: contract.clientManager,
      gestorFornecedor: contract.supplierManager,
      valor: contract.totalValue,
      funcionarios: contract.employeeCount,
      funcoes: contract.functions.length
    }))
    
    console.log('Exportando dados:', dataToExport)
    // Implementar download real do arquivo
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
  const suggestedColumns = columns.filter(col => col.category === 'suggested')
  const allColumns = columns.filter(col => col.category === 'all')

  const renderCellContent = (contract: Contract, columnKey: string) => {
    switch (columnKey) {
      case 'escopo':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.scope || contract.name}</span>
      case 'numeroContrato':
        return <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{contract.code}</span>
      case 'cliente':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.client || 'Cliente Padrão'}</span>
      case 'status':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            contract.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
          }`}>
            {contract.isActive ? 'Ativo' : 'Inativo'}
          </span>
        )
      case 'gestorCliente':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.clientManager || 'Não definido'}</span>
      case 'gestorFornecedor':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.supplierManager || 'Não definido'}</span>
      case 'projetoSankhya':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.sankhyaProject || 'Não vinculado'}</span>
      case 'prazoExecucao':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.executionDeadline ? `${contract.executionDeadline} dias` : 'Não definido'}</span>
      case 'valor':
        return <span className="text-sm font-medium text-green-600 dark:text-green-400">{formatCurrency(contract.totalValue || 0)}</span>
      case 'dataInicio':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.startDate ? formatDate(contract.startDate) : 'Não definida'}</span>
      case 'dataFim':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.endDate ? formatDate(contract.endDate) : 'Não definida'}</span>
      case 'horasDia':
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <span className="text-sm text-gray-900 dark:text-slate-100">{contract.workdayHours}h</span>
          </div>
        )
      case 'funcionarios':
        return (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <span className="text-sm text-gray-900 dark:text-slate-100">{contract.employeeCount}</span>
          </div>
        )
      case 'funcoes':
        return (
          <div className="flex items-center gap-1">
            <UserCheck className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <span className="text-sm text-gray-900 dark:text-slate-100">{contract.functions.length}</span>
          </div>
        )
      case 'contratada':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.contractorCompany || 'Não definida'}</span>
      case 'cnpjContratada':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.contractorCNPJ || 'Não informado'}</span>
      case 'sistemaContratada':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.contractorSystem || 'Não definido'}</span>
      case 'incluiFds':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            contract.includesWeekends ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
          }`}>
            {contract.includesWeekends ? 'Sim' : 'Não'}
          </span>
        )
      case 'incluiFeriados':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            contract.includesHolidays ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
          }`}>
            {contract.includesHolidays ? 'Sim' : 'Não'}
          </span>
        )
      case 'prazoAso':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contract.asoExpirationDays} dias</span>
      default:
        return <span className="text-sm text-gray-500 dark:text-slate-400">-</span>
    }
  }

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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Contratos</h1>
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
                {!userPermissions.canViewAllContracts && (
                  <span className="text-xs text-blue-700 dark:text-blue-400">
                    ({userPermissions.allowedContracts.length} contrato{userPermissions.allowedContracts.length !== 1 ? 's' : ''})
                  </span>
                )}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { 
              label: 'Total Contratos', 
              value: contracts.length, 
              icon: FileText,
              color: 'blue' 
            },
            { 
              label: 'Contratos Ativos', 
              value: contracts.filter(c => c.isActive).length,
              icon: Building,
              color: 'green' 
            },
            { 
              label: 'Total Funções', 
              value: contracts.reduce((acc, c) => acc + c.functions.length, 0),
              icon: Users,
              color: 'purple' 
            },
            { 
              label: 'Total Funcionários', 
              value: contracts.reduce((acc, c) => acc + c.employeeCount, 0),
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

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar contratos por nome, código ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  Contratos ({filteredContracts.length})
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
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                        <th className="text-left p-4">
                          <input
                            type="checkbox"
                            checked={selectedContracts.length === filteredContracts.length}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                          />
                        </th>
                      )}
                      {enabledColumns.map((column) => (
                        <th 
                          key={column.key} 
                          className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300"
                          style={{ width: column.width }}
                        >
                          {column.label}
                        </th>
                      ))}
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                        {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedContracts.includes(contract.id)}
                              onChange={() => handleSelectContract(contract.id)}
                              className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                            />
                          </td>
                        )}
                        {enabledColumns.map((column) => (
                          <td key={column.key} className="p-4">
                            {renderCellContent(contract, column.key)}
                          </td>
                        ))}
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedContractData(contract)
                                setShowViewModal(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedContractData(contract)
                                    setShowEditModal(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDuplicateContract(contract)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteContract(contract.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Column Configuration Modal */}
        {showColumnConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Configurar Colunas</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowColumnConfig(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Seção Sugerido */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                  Sugerido
                </h4>
                <div className="space-y-3">
                  {suggestedColumns.map((column) => (
                    <div key={column.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{column.label}</span>
                      <button
                        onClick={() => handleColumnToggle(column.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          column.enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            column.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção Todas as Colunas */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                  Todas as Colunas
                </h4>
                <div className="space-y-3">
                  {allColumns.map((column) => (
                    <div key={column.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{column.label}</span>
                      <button
                        onClick={() => handleColumnToggle(column.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          column.enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            column.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setShowColumnConfig(false)}>
                  Fechar
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Contract Modal */}
        {showAddModal && validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Novo Contrato</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleAddContract(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Nome do Contrato
                    </label>
                    <input
                      type="text"
                      required
                      value={newContract.name || ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Código do Contrato
                    </label>
                    <input
                      type="text"
                      required
                      value={newContract.code || ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Escopo
                    </label>
                    <input
                      type="text"
                      value={newContract.scope || ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, scope: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Cliente
                    </label>
                    <input
                      type="text"
                      value={newContract.client || ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, client: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Gestor Cliente
                    </label>
                    <input
                      type="text"
                      value={newContract.clientManager || ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, clientManager: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Gestor Fornecedor
                    </label>
                    <input
                      type="text"
                      value={newContract.supplierManager || ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, supplierManager: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Projeto Sankhya
                    </label>
                    <input
                      type="text"
                      value={newContract.sankhyaProject || ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, sankhyaProject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Valor Total
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newContract.totalValue || ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, totalValue: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Horas por Dia
                    </label>
                    <input
                      type="number"
                      value={newContract.workdayHours || 8}
                      onChange={(e) => setNewContract(prev => ({ ...prev, workdayHours: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Empresa Contratada
                    </label>
                    <input
                      type="text"
                      value={newContract.contractorCompany || ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, contractorCompany: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      CNPJ Contratada
                    </label>
                    <input
                      type="text"
                      value={newContract.contractorCNPJ || ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, contractorCNPJ: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Sistema Contratada
                    </label>
                    <input
                      type="text"
                      value={newContract.contractorSystem || ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, contractorSystem: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Prazo ASO (dias)
                    </label>
                    <input
                      type="number"
                      value={newContract.asoExpirationDays || 15}
                      onChange={(e) => setNewContract(prev => ({ ...prev, asoExpirationDays: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={newContract.startDate ? newContract.startDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Data de Fim
                    </label>
                    <input
                      type="date"
                      value={newContract.endDate ? newContract.endDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setNewContract(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newContract.includesWeekends || false}
                      onChange={(e) => setNewContract(prev => ({ ...prev, includesWeekends: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Inclui Fins de Semana
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newContract.includesHolidays || false}
                      onChange={(e) => setNewContract(prev => ({ ...prev, includesHolidays: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Inclui Feriados
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newContract.isActive ?? true}
                      onChange={(e) => setNewContract(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Contrato Ativo
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Contrato
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Contract Modal */}
        {showEditModal && selectedContractData && validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Editar Contrato</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleEditContract(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Nome do Contrato
                    </label>
                    <input
                      type="text"
                      required
                      value={selectedContractData.name}
                      onChange={(e) => setSelectedContractData(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Código do Contrato
                    </label>
                    <input
                      type="text"
                      required
                      value={selectedContractData.code}
                      onChange={(e) => setSelectedContractData(prev => prev ? { ...prev, code: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Escopo
                    </label>
                    <input
                      type="text"
                      value={selectedContractData.scope || ''}
                      onChange={(e) => setSelectedContractData(prev => prev ? { ...prev, scope: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Cliente
                    </label>
                    <input
                      type="text"
                      value={selectedContractData.client || ''}
                      onChange={(e) => setSelectedContractData(prev => prev ? { ...prev, client: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Valor Total
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedContractData.totalValue || ''}
                      onChange={(e) => setSelectedContractData(prev => prev ? { ...prev, totalValue: parseFloat(e.target.value) } : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Horas por Dia
                    </label>
                    <input
                      type="number"
                      value={selectedContractData.workdayHours}
                      onChange={(e) => setSelectedContractData(prev => prev ? { ...prev, workdayHours: parseInt(e.target.value) } : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedContractData.includesWeekends}
                      onChange={(e) => setSelectedContractData(prev => prev ? { ...prev, includesWeekends: e.target.checked } : null)}
                      className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Inclui Fins de Semana
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedContractData.includesHolidays}
                      onChange={(e) => setSelectedContractData(prev => prev ? { ...prev, includesHolidays: e.target.checked } : null)}
                      className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Inclui Feriados
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedContractData.isActive}
                      onChange={(e) => setSelectedContractData(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                      className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Contrato Ativo
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* View Contract Modal */}
        {showViewModal && selectedContractData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Detalhes do Contrato</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowViewModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{selectedContractData.name}</h4>
                    <p className="text-gray-600 dark:text-slate-400">{selectedContractData.code}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedContractData.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {selectedContractData.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Informações Básicas</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Escopo:</span>
                        <span className="font-medium text-gray-900 dark:text-slate-100">{selectedContractData.scope || 'Não definido'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Cliente:</span>
                        <span className="font-medium text-gray-900 dark:text-slate-100">{selectedContractData.client || 'Não definido'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Valor Total:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(selectedContractData.totalValue || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Horas/Dia:</span>
                        <span className="font-medium text-gray-900 dark:text-slate-100">{selectedContractData.workdayHours}h</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Gestão</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Gestor Cliente:</span>
                        <span className="font-medium text-gray-900 dark:text-slate-100">{selectedContractData.clientManager || 'Não definido'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Gestor Fornecedor:</span>
                        <span className="font-medium text-gray-900 dark:text-slate-100">{selectedContractData.supplierManager || 'Não definido'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Projeto Sankhya:</span>
                        <span className="font-medium text-gray-900 dark:text-slate-100">{selectedContractData.sankhyaProject || 'Não vinculado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Funcionários:</span>
                        <span className="font-medium text-gray-900 dark:text-slate-100">{selectedContractData.employeeCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Empresa Contratada</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-slate-400">Empresa:</span>
                      <p className="font-medium text-gray-900 dark:text-slate-100">{selectedContractData.contractorCompany || 'Não definida'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-slate-400">CNPJ:</span>
                      <p className="font-medium text-gray-900 dark:text-slate-100">{selectedContractData.contractorCNPJ || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-slate-400">Sistema:</span>
                      <p className="font-medium text-gray-900 dark:text-slate-100">{selectedContractData.contractorSystem || 'Não definido'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Configurações</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-3 rounded-lg ${selectedContractData.includesWeekends ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-slate-700'}`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium">Fins de Semana</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                        {selectedContractData.includesWeekends ? 'Incluído' : 'Não incluído'}
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${selectedContractData.includesHolidays ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-slate-700'}`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium">Feriados</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                        {selectedContractData.includesHolidays ? 'Incluído' : 'Não incluído'}
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium">Prazo ASO</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                        {selectedContractData.asoExpirationDays} dias
                      </p>
                    </div>
                  </div>
                </div>

                {selectedContractData.functions.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Funções ({selectedContractData.functions.length})</h5>
                    <div className="space-y-2">
                      {selectedContractData.functions.map((func) => (
                        <div key={func.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{func.name}</p>
                            <p className="text-xs text-gray-600 dark:text-slate-400">{func.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{func.employeeCount} funcionários</p>
                            <p className="text-xs text-gray-600 dark:text-slate-400">{func.isActive ? 'Ativa' : 'Inativa'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setShowViewModal(false)}>
                  Fechar
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Empty State */}
        {filteredContracts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">Nenhum contrato encontrado</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6">Tente ajustar seus termos de busca ou crie um novo contrato.</p>
            {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Contrato
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}