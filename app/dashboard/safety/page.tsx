'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Search, 
  Plus, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Users,
  Calendar,
  Settings,
  Building,
  Edit,
  Trash2,
  Eye,
  X,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  mockASOs, 
  mockEmployeeTrainings, 
  mockContracts,
  mockTrainings,
  ASO, 
  EmployeeTraining,
  Training,
  ContractTraining
} from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import { 
  getCurrentUser, 
  getUserPermissions, 
  validateUserAccess,
  User as AuthUser,
  UserRole
} from '@/lib/auth'

export default function SafetyPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [asos] = useState<ASO[]>(mockASOs)
  const [trainings] = useState<EmployeeTraining[]>(mockEmployeeTrainings)
  const [availableTrainings] = useState<Training[]>(mockTrainings)
  const [activeTab, setActiveTab] = useState<'asos' | 'trainings' | 'contract-trainings'>('asos')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContract, setSelectedContract] = useState<string>('all')
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [contractTrainings, setContractTrainings] = useState<ContractTraining[]>([])

  // Inicializar usuário e permissões
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)

    // Carregar treinamentos dos contratos
    const allContractTrainings = mockContracts.flatMap(contract => contract.requiredTrainings)
    setContractTrainings(allContractTrainings)
  }, [])

  const filteredASOs = asos.filter(aso => 
    aso.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTrainings = trainings.filter(training => 
    training.trainingName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredContractTrainings = contractTrainings.filter(ct => {
    const matchesSearch = ct.trainingName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesContract = selectedContract === 'all' || ct.contractId === selectedContract
    return matchesSearch && matchesContract
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'expiring': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'expired': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800'
      case 'expiring': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

  const handleAddTrainingToContract = (contractId: string, trainingId: string, isImpeditive: boolean, notes: string) => {
    const training = availableTrainings.find(t => t.id === trainingId)
    const contract = mockContracts.find(c => c.id === contractId)
    
    if (training && contract && currentUser) {
      const newContractTraining: ContractTraining = {
        id: `ct-${Date.now()}`,
        contractId,
        trainingId,
        trainingName: training.name,
        isRequired: true,
        isImpeditive,
        addedBy: currentUser.name,
        addedByRole: currentUser.role,
        addedAt: new Date(),
        notes
      }
      
      setContractTrainings(prev => [...prev, newContractTraining])
      setShowAddTrainingModal(false)
    }
  }

  const handleRemoveTrainingFromContract = (contractTrainingId: string) => {
    setContractTrainings(prev => prev.filter(ct => ct.id !== contractTrainingId))
  }

  const handleUpdateASOExpirationDays = (contractId: string, days: number) => {
    // Em produção, isso seria uma chamada à API
    
  }

  if (!currentUser || !userPermissions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando permissões...</span>
        </div>
      </div>
    )
  }

  // Verificar se usuário tem permissão para acessar segurança
  if (!validateUserAccess(currentUser, 'MANAGE_SAFETY')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <p className="text-sm text-gray-500">
            {`Perfil atual: ${getRoleDisplayName(currentUser.role)}`}
          </p>
        </div>
      </div>
    )
  }

  const safetyStats = {
    totalASOs: asos.length,
    validASOs: asos.filter(a => a.status === 'valid').length,
    expiringASOs: asos.filter(a => a.status === 'expiring').length,
    expiredASOs: asos.filter(a => a.status === 'expired').length,
    totalTrainings: trainings.length,
    validTrainings: trainings.filter(t => t.status === 'valid').length,
    expiringTrainings: trainings.filter(t => t.status === 'expiring').length,
    expiredTrainings: trainings.filter(t => t.status === 'expired').length,
    totalContractTrainings: contractTrainings.length,
    impeditiveTrainings: contractTrainings.filter(ct => ct.isImpeditive).length
  }

  return (
    <div className="space-y-6">
      {/* Header com Informações de Permissão */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Segurança</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Monitorando...</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {getRoleDisplayName(currentUser.role)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowConfigModal(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Registro
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { 
            label: 'ASOs Válidos', 
            value: safetyStats.validASOs, 
            total: safetyStats.totalASOs,
            color: 'green',
            icon: CheckCircle
          },
          { 
            label: 'ASOs Vencendo', 
            value: safetyStats.expiringASOs,
            total: safetyStats.totalASOs,
            color: 'yellow',
            icon: AlertTriangle 
          },
          { 
            label: 'Treinamentos Válidos', 
            value: safetyStats.validTrainings,
            total: safetyStats.totalTrainings,
            color: 'blue',
            icon: Shield 
          },
          { 
            label: 'Itens Vencidos', 
            value: safetyStats.expiredASOs + safetyStats.expiredTrainings,
            total: safetyStats.totalASOs + safetyStats.totalTrainings,
            color: 'red',
            icon: XCircle 
          },
          {
            label: 'Treinamentos Impeditivos',
            value: safetyStats.impeditiveTrainings,
            total: safetyStats.totalContractTrainings,
            color: 'purple',
            icon: AlertTriangle
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
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">de {stat.total}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stat.label}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`bg-${stat.color}-500 h-2 rounded-full`}
                      style={{ width: `${stat.total > 0 ? (stat.value / stat.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and Tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar funcionários ou treinamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            {activeTab === 'contract-trainings' && (
              <div className="flex gap-3">
                <select
                  value={selectedContract}
                  onChange={(e) => setSelectedContract(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Todos os Contratos</option>
                  {mockContracts.map(contract => (
                    <option key={contract.id} value={contract.id}>
                      {contract.name}
                    </option>
                  ))}
                </select>
                {validateUserAccess(currentUser, 'MANAGE_CONTRACT_TRAININGS') && (
                  <Button size="sm" onClick={() => setShowAddTrainingModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Treinamento
                  </Button>
                )}
              </div>
            )}
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('asos')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'asos' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Registros ASO
              </button>
              <button
                onClick={() => setActiveTab('trainings')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'trainings' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Treinamentos
              </button>
              <button
                onClick={() => setActiveTab('contract-trainings')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'contract-trainings' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Treinamentos por Contrato
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'asos' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Registros ASO ({filteredASOs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Funcionário</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Tipo de Exame</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Data do Exame</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Válido Até</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Resultado</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredASOs.map((aso) => (
                      <tr key={aso.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{aso.employeeName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900">{aso.examType.replace('_', ' ')}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900">{formatDate(aso.examDate)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900">{formatDate(aso.validUntil)}</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            aso.result === 'FIT' ? 'bg-green-100 text-green-800' :
                            aso.result === 'FIT_WITH_RESTRICTIONS' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {aso.result.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(aso.status)}
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(aso.status)}`}>
                              {aso.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4" />
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
        )}

        {activeTab === 'trainings' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Registros de Treinamento ({filteredTrainings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Funcionário</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Treinamento</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Concluído</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Válido Até</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTrainings.map((training) => (
                      <tr key={training.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Funcionário #{training.employeeId}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900">{training.trainingName}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900">{formatDate(training.completedAt)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900">{formatDate(training.validUntil)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(training.status)}
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(training.status)}`}>
                              {training.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4" />
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
        )}

        {activeTab === 'contract-trainings' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Treinamentos por Contrato ({filteredContractTrainings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Contrato</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Treinamento</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Tipo</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Adicionado por</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Data</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Observações</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredContractTrainings.map((contractTraining) => {
                      const contract = mockContracts.find(c => c.id === contractTraining.contractId)
                      return (
                        <tr key={contractTraining.id} className="hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{contract?.name}</p>
                                <p className="text-xs text-gray-500">{contract?.code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-900">{contractTraining.trainingName}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                contractTraining.isRequired ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {contractTraining.isRequired ? 'Obrigatório' : 'Opcional'}
                              </span>
                              {contractTraining.isImpeditive && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  Impeditivo
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm text-gray-900">{contractTraining.addedBy}</p>
                              <p className="text-xs text-gray-500">{getRoleDisplayName(contractTraining.addedByRole)}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-900">{formatDate(contractTraining.addedAt)}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600">{contractTraining.notes || '-'}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {validateUserAccess(currentUser, 'MANAGE_CONTRACT_TRAININGS') && (
                                <>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleRemoveTrainingFromContract(contractTraining.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Add Training to Contract Modal */}
      {showAddTrainingModal && validateUserAccess(currentUser, 'MANAGE_CONTRACT_TRAININGS') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Adicionar Treinamento ao Contrato</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAddTrainingModal(false)}
              >
                ×
              </Button>
            </div>

            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              handleAddTrainingToContract(
                formData.get('contractId') as string,
                formData.get('trainingId') as string,
                formData.get('isImpeditive') === 'on',
                formData.get('notes') as string
              )
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contrato
                  </label>
                  <select 
                    name="contractId"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Selecione um contrato</option>
                    {mockContracts.map(contract => (
                      <option key={contract.id} value={contract.id}>
                        {contract.name} ({contract.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treinamento
                  </label>
                  <select 
                    name="trainingId"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Selecione um treinamento</option>
                    {availableTrainings.map(training => (
                      <option key={training.id} value={training.id}>
                        {training.name} ({training.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isImpeditive"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Impeditivo para transferências
                  </span>
                </label>
                <div className="text-xs text-gray-500">
                  Se marcado, funcionários sem este treinamento válido não poderão ser transferidos para este contrato
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Observações sobre este requisito..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowAddTrainingModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Adicionar Treinamento
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && validateUserAccess(currentUser, 'MANAGE_CONTRACT_TRAININGS') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Configurações de Segurança</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowConfigModal(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Prazos de Vencimento ASO por Contrato</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Configure quantos dias antes do vencimento do ASO o sistema deve considerar como "vencendo" para bloqueio de transferências.
                </p>
                
                <div className="space-y-4">
                  {mockContracts.map(contract => (
                    <div key={contract.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">{contract.name}</h5>
                        <p className="text-sm text-gray-500">{contract.code}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-700">Dias:</label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          defaultValue={contract.asoExpirationDays}
                          onChange={(e) => handleUpdateASOExpirationDays(contract.id, parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span className="text-sm text-gray-500">dias</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Informações Adicionais</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Treinamentos Impeditivos:</strong> Quando marcados como impeditivos, funcionários sem estes treinamentos válidos não poderão ser transferidos para o contrato.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Auto Validação:</strong> O sistema verifica automaticamente os requisitos de segurança antes de permitir transferências.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Settings className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Configurações Flexíveis:</strong> Gestores podem ajustar os prazos de vencimento ASO conforme a necessidade de cada contrato.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <Button onClick={() => setShowConfigModal(false)}>
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}