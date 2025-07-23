'use client'

import { useState, useEffect } from 'react'
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
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

// Tipos básicos para segurança
interface ASO {
  id: string
  employeeId: string
  employeeName: string
  examType: string
  examDate: Date
  validUntil: Date
  result: string
  status: 'valid' | 'expiring' | 'expired'
}

interface EmployeeTraining {
  id: string
  employeeId: string
  trainingName: string
  completedAt: Date
  validUntil: Date
  status: 'valid' | 'expiring' | 'expired'
}

interface Training {
  id: string
  name: string
  category: string
  description: string
  duration: number
  isActive: boolean
}

interface ContractTraining {
  id: string
  contractId: string
  trainingId: string
  trainingName: string
  isRequired: boolean
  isImpeditive: boolean
  addedBy: string
  addedByRole: string
  addedAt: Date
  notes?: string
}

interface Contract {
  id: string
  name: string
  code: string
  asoExpirationDays: number
  requiredTrainings: ContractTraining[]
}

// Mock de dados para demonstração
const mockASOs: ASO[] = [
  {
    id: '1',
    employeeId: 'emp-1',
    employeeName: 'João Silva',
    examType: 'ADMISSION',
    examDate: new Date('2024-01-15'),
    validUntil: new Date('2025-01-15'),
    result: 'FIT',
    status: 'valid'
  },
  {
    id: '2',
    employeeId: 'emp-2',
    employeeName: 'Maria Santos',
    examType: 'PERIODIC',
    examDate: new Date('2024-06-01'),
    validUntil: new Date('2024-12-01'),
    result: 'FIT_WITH_RESTRICTIONS',
    status: 'expiring'
  },
  {
    id: '3',
    employeeId: 'emp-3',
    employeeName: 'Pedro Costa',
    examType: 'ADMISSION',
    examDate: new Date('2023-12-01'),
    validUntil: new Date('2024-06-01'),
    result: 'FIT',
    status: 'expired'
  }
]

const mockEmployeeTrainings: EmployeeTraining[] = [
  {
    id: '1',
    employeeId: 'emp-1',
    trainingName: 'NR-10 - Segurança em Instalações Elétricas',
    completedAt: new Date('2024-02-01'),
    validUntil: new Date('2025-02-01'),
    status: 'valid'
  },
  {
    id: '2',
    employeeId: 'emp-2',
    trainingName: 'NR-35 - Trabalho em Altura',
    completedAt: new Date('2024-03-15'),
    validUntil: new Date('2024-09-15'),
    status: 'expiring'
  },
  {
    id: '3',
    employeeId: 'emp-3',
    trainingName: 'NR-11 - Transporte de Cargas',
    completedAt: new Date('2023-11-01'),
    validUntil: new Date('2024-05-01'),
    status: 'expired'
  }
]

const mockTrainings: Training[] = [
  {
    id: '1',
    name: 'NR-10 - Segurança em Instalações Elétricas',
    category: 'Elétrica',
    description: 'Treinamento obrigatório para trabalhos com eletricidade',
    duration: 40,
    isActive: true
  },
  {
    id: '2',
    name: 'NR-35 - Trabalho em Altura',
    category: 'Altura',
    description: 'Treinamento para trabalhos em altura',
    duration: 16,
    isActive: true
  },
  {
    id: '3',
    name: 'NR-11 - Transporte de Cargas',
    category: 'Movimentação',
    description: 'Treinamento para operação de equipamentos',
    duration: 24,
    isActive: true
  }
]

const mockContracts: Contract[] = [
  {
    id: '1',
    name: 'Contrato Operacional',
    code: 'CONT-001',
    asoExpirationDays: 30,
    requiredTrainings: []
  },
  {
    id: '2',
    name: 'Contrato Administrativo',
    code: 'CONT-002',
    asoExpirationDays: 15,
    requiredTrainings: []
  }
]

export default function SafetyPage() {
  const [asos] = useState<ASO[]>(mockASOs)
  const [trainings] = useState<EmployeeTraining[]>(mockEmployeeTrainings)
  const [availableTrainings] = useState<Training[]>(mockTrainings)
  const [activeTab, setActiveTab] = useState<'asos' | 'trainings' | 'contract-trainings'>('asos')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContract, setSelectedContract] = useState<string>('all')
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [contractTrainings, setContractTrainings] = useState<ContractTraining[]>([])

  // Carregar treinamentos dos contratos
  useEffect(() => {
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

  const handleAddTrainingToContract = (contractId: string, trainingId: string, isImpeditive: boolean, notes: string) => {
    const training = availableTrainings.find(t => t.id === trainingId)
    const contract = mockContracts.find(c => c.id === contractId)
    
    if (training && contract) {
      const newContractTraining: ContractTraining = {
        id: `ct-${Date.now()}`,
        contractId,
        trainingId,
        trainingName: training.name,
        isRequired: true,
        isImpeditive,
        addedBy: 'Administrador',
        addedByRole: 'Admin',
        addedAt: new Date(),
        notes
      }
      
      setContractTrainings(prev => [...prev, newContractTraining])
      setShowAddTrainingModal(false)
      toast.success('Treinamento adicionado com sucesso!')
    }
  }

  const handleRemoveTrainingFromContract = (contractTrainingId: string) => {
    setContractTrainings(prev => prev.filter(ct => ct.id !== contractTrainingId))
    toast.success('Treinamento removido com sucesso!')
  }

  const handleUpdateASOExpirationDays = (contractId: string, days: number) => {
    // Em produção, isso seria uma chamada à API
    toast.success('Configuração atualizada com sucesso!')
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Segurança</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Monitorando...</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Administrador
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
          <div
            key={stat.label}
            className="transition-all duration-300 ease-in-out"
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
          </div>
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
                <Button size="sm" onClick={() => setShowAddTrainingModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Treinamento
                </Button>
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
      <div
        key={activeTab}
        className="transition-all duration-300 ease-in-out"
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
                              <p className="text-xs text-gray-500">{contractTraining.addedByRole}</p>
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
      </div>

      {/* Add Training to Contract Modal */}
      {showAddTrainingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
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
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
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
          </div>
        </div>
      )}
    </div>
  )
}