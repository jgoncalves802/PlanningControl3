'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  Download,
  Mail,
  Phone,
  Shield,
  Settings,
  Trash2,
  UserPlus,
  FileText,
  Calendar,
  Building,
  MapPin,
  Clock,
  X,
  Check,
  Save
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockEmployees, Employee, mockContracts } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import { 
  getCurrentUser, 
  getUserPermissions, 
  getAccessibleContracts, 
  canUserAccessContract,
  validateUserAccess,
  User,
  UserRole
} from '@/lib/auth'

// Configuração das colunas disponíveis
interface ColumnConfig {
  key: string
  label: string
  enabled: boolean
  width?: string
}

const defaultColumns: ColumnConfig[] = [
  { key: 'name', label: 'Nome', enabled: true, width: '200px' },
  { key: 'cpf', label: 'CPF', enabled: true, width: '120px' },
  { key: 'matricula', label: 'Matrícula', enabled: false, width: '100px' },
  { key: 'cargo', label: 'Cargo', enabled: true, width: '150px' },
  { key: 'status', label: 'Status', enabled: true, width: '100px' },
  { key: 'cidade', label: 'Cidade', enabled: false, width: '120px' },
  { key: 'telefone', label: 'Telefone/Celular', enabled: false, width: '130px' },
  { key: 'dataEntrada', label: 'Data de Entrada', enabled: true, width: '120px' },
  { key: 'contrato', label: 'Nº Contrato', enabled: true, width: '120px' },
  { key: 'centroCusto', label: 'Centro de Custo', enabled: false, width: '120px' },
  { key: 'turno', label: 'Turno', enabled: false, width: '80px' },
  { key: 'obra', label: 'Obra', enabled: false, width: '120px' },
  { key: 'primeiraExperiencia', label: 'Primeira Experiência', enabled: false, width: '140px' },
  { key: 'segundaExperiencia', label: 'Segunda Experiência', enabled: false, width: '140px' },
  { key: 'previsaoObra', label: 'Previsão na Obra', enabled: false, width: '120px' }
]

export default function EmployeesPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({})

  // Inicializar usuário e permissões
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)
    
    // Filtrar funcionários baseado nas permissões
    const accessibleEmployees = mockEmployees.filter(employee => {
      if (!employee.currentContractId || !employee.isActive) return false
      return canUserAccessContract(user, employee.currentContractId)
    })
    
    setEmployees(accessibleEmployees)

    // Carregar configuração de colunas salva
    const savedColumns = localStorage.getItem('employee-columns')
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns))
      } catch (error) {
        console.error('Erro ao carregar configuração de colunas:', error)
      }
    }
  }, [])

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.cpf.includes(searchTerm) ||
                         employee.currentContract?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'on_leave': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'transferred': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'on_leave': return 'Em Licença'
      case 'transferred': return 'Transferido'
      case 'dismissed': return 'Demitido'
      default: return status
    }
  }

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSelectAll = () => {
    setSelectedEmployees(
      selectedEmployees.length === filteredEmployees.length 
        ? [] 
        : filteredEmployees.map(e => e.id)
    )
  }

  const handleColumnToggle = (columnKey: string) => {
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, enabled: !col.enabled } : col
    )
    setColumns(updatedColumns)
    localStorage.setItem('employee-columns', JSON.stringify(updatedColumns))
  }

  const handleAddEmployee = () => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    const employee: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmployee.name || '',
      cpf: newEmployee.cpf || '',
      currentContractId: newEmployee.currentContractId,
      currentContract: mockContracts.find(c => c.id === newEmployee.currentContractId)?.name,
      currentFunction: newEmployee.currentFunction,
      admissionDate: newEmployee.admissionDate || new Date(),
      isActive: true,
      status: 'active',
      email: newEmployee.email,
      phone: newEmployee.phone
    }
    
    setEmployees(prev => [...prev, employee])
    setNewEmployee({})
    setShowAddModal(false)
  }

  const handleEditEmployee = () => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES') || !selectedEmployee) return
    
    setEmployees(prev => prev.map(emp => 
      emp.id === selectedEmployee.id ? { ...selectedEmployee } : emp
    ))
    setShowEditModal(false)
    setSelectedEmployee(null)
  }

  const handleDeleteEmployee = (employeeId: string) => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId))
    }
  }

  const handleBulkDelete = () => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    if (confirm(`Tem certeza que deseja excluir ${selectedEmployees.length} funcionários selecionados?`)) {
      setEmployees(prev => prev.filter(emp => !selectedEmployees.includes(emp.id)))
      setSelectedEmployees([])
    }
  }

  const exportData = () => {
    const dataToExport = filteredEmployees.map(emp => ({
      nome: emp.name,
      cpf: emp.cpf,
      contrato: emp.currentContract,
      funcao: emp.currentFunction,
      status: getStatusLabel(emp.status),
      admissao: formatDate(emp.admissionDate),
      email: emp.email,
      telefone: emp.phone
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

  const renderCellContent = (employee: Employee, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              {employee.avatar ? (
                <img 
                  src={employee.avatar} 
                  alt={employee.name} 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{employee.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {employee.email && <Mail className="h-3 w-3 text-gray-400 dark:text-slate-500" />}
                {employee.phone && <Phone className="h-3 w-3 text-gray-400 dark:text-slate-500" />}
              </div>
            </div>
          </div>
        )
      case 'cpf':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.cpf}</span>
      case 'matricula':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.id.padStart(6, '0')}</span>
      case 'cargo':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.currentFunction || 'Não atribuído'}</span>
      case 'status':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
            {getStatusLabel(employee.status)}
          </span>
        )
      case 'cidade':
        return <span className="text-sm text-gray-900 dark:text-slate-100">São Paulo</span>
      case 'telefone':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.phone || '-'}</span>
      case 'dataEntrada':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{formatDate(employee.admissionDate)}</span>
      case 'contrato':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.currentContract || 'Não atribuído'}</span>
      case 'centroCusto':
        return <span className="text-sm text-gray-900 dark:text-slate-100">CC-{Math.floor(Math.random() * 1000)}</span>
      case 'turno':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Diurno</span>
      case 'obra':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Obra A</span>
      case 'primeiraExperiencia':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Construção Civil</span>
      case 'segundaExperiencia':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Soldagem</span>
      case 'previsaoObra':
        return <span className="text-sm text-gray-900 dark:text-slate-100">12 meses</span>
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
    <div className="space-y-6">
      {/* Header com Informações de Permissão */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Funcionários</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600 dark:text-slate-400">Gerencie sua força de trabalho e informações dos funcionários</p>
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
              Adicionar Funcionário
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Funcionários', value: employees.length, color: 'blue' },
          { label: 'Ativos', value: employees.filter(e => e.status === 'active').length, color: 'green' },
          { label: 'Em Licença', value: employees.filter(e => e.status === 'on_leave').length, color: 'yellow' },
          { label: 'Contratações Recentes', value: 2, color: 'purple' }
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
                    <Users className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar funcionários por nome, CPF ou contrato..."
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
                <option value="on_leave">Em Licença</option>
                <option value="transferred">Transferido</option>
                <option value="dismissed">Demitido</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Funcionários ({filteredEmployees.length})
              </CardTitle>
              {selectedEmployees.length > 0 && validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-slate-400">
                    {selectedEmployees.length} selecionados
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
                          checked={selectedEmployees.length === filteredEmployees.length}
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
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                      {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={() => handleSelectEmployee(employee.id)}
                            className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                          />
                        </td>
                      )}
                      {enabledColumns.map((column) => (
                        <td key={column.key} className="p-4">
                          {renderCellContent(employee, column.key)}
                        </td>
                      ))}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(employee)
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
                                  setSelectedEmployee(employee)
                                  setShowEditModal(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteEmployee(employee.id)}
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

            <div className="space-y-3">
              {columns.map((column) => (
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

            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowColumnConfig(false)}>
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Adicionar Funcionário</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleAddEmployee(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.name || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    CPF
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.cpf || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, cpf: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmployee.email || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={newEmployee.phone || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Contrato
                  </label>
                  <select
                    value={newEmployee.currentContractId || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, currentContractId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">Selecione um contrato</option>
                    {mockContracts.map(contract => (
                      <option key={contract.id} value={contract.id}>
                        {contract.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Função
                  </label>
                  <input
                    type="text"
                    value={newEmployee.currentFunction || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, currentFunction: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>
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
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Funcionário
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Editar Funcionário</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleEditEmployee(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedEmployee.name}
                    onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    CPF
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedEmployee.cpf}
                    onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, cpf: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedEmployee.email || ''}
                    onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={selectedEmployee.phone || ''}
                    onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedEmployee.status}
                    onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <option value="active">Ativo</option>
                    <option value="on_leave">Em Licença</option>
                    <option value="transferred">Transferido</option>
                    <option value="dismissed">Demitido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Função
                  </label>
                  <input
                    type="text"
                    value={selectedEmployee.currentFunction || ''}
                    onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, currentFunction: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>
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

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Detalhes do Funcionário</h3>
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
                  {selectedEmployee.avatar ? (
                    <img 
                      src={selectedEmployee.avatar} 
                      alt={selectedEmployee.name} 
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <span className="text-white text-lg font-medium">
                      {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{selectedEmployee.name}</h4>
                  <p className="text-gray-600 dark:text-slate-400">{selectedEmployee.currentFunction || 'Função não definida'}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedEmployee.status)}`}>
                    {getStatusLabel(selectedEmployee.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Informações Pessoais</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">CPF:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{selectedEmployee.cpf}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Email:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{selectedEmployee.email || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Telefone:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{selectedEmployee.phone || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Informações Profissionais</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Contrato:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{selectedEmployee.currentContract || 'Não atribuído'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Admissão:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{formatDate(selectedEmployee.admissionDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Matrícula:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{selectedEmployee.id.padStart(6, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowViewModal(false)}>
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Mostrando {filteredEmployees.length} de {employees.length} funcionários
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}