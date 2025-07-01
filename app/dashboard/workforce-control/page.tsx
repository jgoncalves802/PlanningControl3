'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Building, 
  Clock, 
  Zap, 
  Search, 
  Filter,
  MapPin,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  BarChart3,
  RefreshCw,
  Download,
  Timer,
  Settings,
  Activity,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockContracts, mockEmployees, Contract, Employee } from '@/lib/mock-data'
import { formatDateTime } from '@/lib/utils'
import { NFCReader } from '@/components/nfc/nfc-reader'
import { 
  getCurrentUser, 
  getUserPermissions, 
  getAccessibleContracts, 
  canUserAccessContract,
  User,
  UserRole
} from '@/lib/auth'

interface WorkforceEntry {
  id: string
  employeeId: string
  employeeName: string
  contractId: string
  contractName: string
  functionName: string
  checkInTime: Date
  checkOutTime?: Date
  status: 'present' | 'absent' | 'late' | 'left'
  location?: string
  nfcCardId: string
}

interface ContractWorkforce {
  contract: Contract
  totalAssigned: number
  present: number
  absent: number
  late: number
  entries: WorkforceEntry[]
}

export default function WorkforceControlPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [accessibleContracts, setAccessibleContracts] = useState<Contract[]>([])
  const [selectedContract, setSelectedContract] = useState<string>('all')
  const [showNFCReader, setShowNFCReader] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [workforceData, setWorkforceData] = useState<WorkforceEntry[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [nfcStatus, setNfcStatus] = useState('idle')

  // Inicializar usuário e permissões
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)
    
    const contracts = getAccessibleContracts(user, mockContracts)
    setAccessibleContracts(contracts)
    
    // Se o usuário só tem acesso a um contrato, selecionar automaticamente
    if (contracts.length === 1) {
      setSelectedContract(contracts[0].id)
    }
  }, [])

  // Gerar dados iniciais de workforce baseado nas permissões
  useEffect(() => {
    if (!currentUser || !userPermissions) return

    const generateInitialWorkforceData = (): WorkforceEntry[] => {
      const entries: WorkforceEntry[] = []
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0)
      
      // Filtrar funcionários baseado nos contratos acessíveis
      const accessibleEmployees = mockEmployees.filter(employee => {
        if (!employee.currentContractId || !employee.isActive) return false
        return canUserAccessContract(currentUser, employee.currentContractId)
      })
      
      accessibleEmployees.forEach((employee) => {
        const contract = accessibleContracts.find(c => c.id === employee.currentContractId)
        if (contract && Math.random() > 0.3) { // 70% já fizeram check-in
          const checkInTime = new Date(startOfDay.getTime() + (Math.random() * 1.5 * 60 * 60 * 1000))
          const isLate = checkInTime.getHours() >= 8 && checkInTime.getMinutes() > 15
          
          entries.push({
            id: `entry-${employee.id}`,
            employeeId: employee.id,
            employeeName: employee.name,
            contractId: contract.id,
            contractName: contract.name,
            functionName: employee.currentFunction || 'Não definida',
            checkInTime,
            status: isLate ? 'late' : 'present',
            location: `Setor ${Math.floor(Math.random() * 5) + 1}`,
            nfcCardId: employee.nfcCardId || `NFC${employee.id.padStart(3, '0')}`
          })
        }
      })
      
      return entries
    }

    setWorkforceData(generateInitialWorkforceData())
  }, [currentUser, userPermissions, accessibleContracts])

  const getContractWorkforce = (): ContractWorkforce[] => {
    return accessibleContracts.map(contract => {
      const contractEntries = workforceData.filter(entry => entry.contractId === contract.id)
      const totalAssigned = mockEmployees.filter(emp => 
        emp.currentContractId === contract.id && 
        emp.isActive &&
        canUserAccessContract(currentUser!, emp.currentContractId)
      ).length
      
      return {
        contract,
        totalAssigned,
        present: contractEntries.filter(entry => entry.status === 'present').length,
        absent: contractEntries.filter(entry => entry.status === 'absent').length,
        late: contractEntries.filter(entry => entry.status === 'late').length,
        entries: contractEntries
      }
    })
  }

  const filteredWorkforce = getContractWorkforce().filter(cw => {
    if (selectedContract !== 'all' && cw.contract.id !== selectedContract) return false
    if (searchTerm) {
      return cw.entries.some(entry => 
        entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.functionName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return true
  })

  const handleNFCRead = (nfcData: string) => {
    const employee = mockEmployees.find(emp => emp.nfcCardId === nfcData)
    
    if (employee && employee.currentContractId && canUserAccessContract(currentUser!, employee.currentContractId)) {
      const now = new Date()
      const existingEntry = workforceData.find(entry => 
        entry.employeeId === employee.id && 
        entry.checkInTime.toDateString() === now.toDateString() &&
        !entry.checkOutTime
      )

      if (existingEntry) {
        // Check-out
        setWorkforceData(prev => prev.map(entry => 
          entry.id === existingEntry.id 
            ? { ...entry, checkOutTime: now, status: 'left' }
            : entry
        ))
        setNfcStatus('success')
      } else {
        // Check-in
        const contract = accessibleContracts.find(c => c.id === employee.currentContractId)
        if (contract) {
          const isLate = now.getHours() >= 8 && now.getMinutes() > 15
          const location = `Setor ${Math.floor(Math.random() * 5) + 1}`
          
          const newEntry: WorkforceEntry = {
            id: `entry-${employee.id}-${now.getTime()}`,
            employeeId: employee.id,
            employeeName: employee.name,
            contractId: employee.currentContractId,
            contractName: contract.name,
            functionName: employee.currentFunction || 'Não definida',
            checkInTime: now,
            status: isLate ? 'late' : 'present',
            location,
            nfcCardId: nfcData
          }
          
          setWorkforceData(prev => [...prev, newEntry])
          setNfcStatus('success')
        }
      }
      
      setLastUpdate(now)
      setTimeout(() => {
        setShowNFCReader(false)
        setNfcStatus('idle')
      }, 2000)
    } else {
      setNfcStatus('error')
      setTimeout(() => setNfcStatus('idle'), 3000)
    }
  }

  const refreshData = () => {
    setLastUpdate(new Date())
    // Em produção, aqui faria uma chamada à API para buscar dados atualizados
  }

  const exportData = () => {
    // Em produção, implementar exportação real dos dados
    const dataToExport = filteredWorkforce.map(cw => ({
      contrato: cw.contract.name,
      totalFuncionarios: cw.totalAssigned,
      presentes: cw.present,
      atrasados: cw.late,
      ausentes: cw.absent,
      funcionarios: cw.entries.map(entry => ({
        nome: entry.employeeName,
        funcao: entry.functionName,
        entrada: entry.checkInTime.toLocaleString('pt-BR'),
        saida: entry.checkOutTime?.toLocaleString('pt-BR') || 'Não registrada',
        status: entry.status,
        local: entry.location
      }))
    }))
    
    console.log('Dados para exportação:', dataToExport)
    // Implementar download do arquivo CSV/Excel
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      case 'left': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <UserCheck className="h-4 w-4 text-green-600" />
      case 'absent': return <UserX className="h-4 w-4 text-red-600" />
      case 'late': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'left': return <CheckCircle className="h-4 w-4 text-gray-600" />
      default: return <Users className="h-4 w-4 text-gray-600" />
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

  const totalStats = {
    totalEmployees: mockEmployees.filter(emp => 
      emp.isActive && 
      emp.currentContractId && 
      canUserAccessContract(currentUser, emp.currentContractId)
    ).length,
    present: workforceData.filter(entry => entry.status === 'present').length,
    absent: mockEmployees.filter(emp => 
      emp.isActive && 
      emp.currentContractId && 
      canUserAccessContract(currentUser, emp.currentContractId)
    ).length - workforceData.filter(entry => entry.status !== 'absent').length,
    late: workforceData.filter(entry => entry.status === 'late').length,
    left: workforceData.filter(entry => entry.status === 'left').length,
  }

  return (
    <div className="space-y-6">
      {/* Header com Informações de Permissão */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle do Efetivo</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Apropriação simultânea e independente por contrato</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {getRoleDisplayName(currentUser.role)}
              </span>
              {!userPermissions.canViewAllContracts && (
                <span className="text-xs text-blue-700">
                  ({userPermissions.allowedContracts.length} contrato{userPermissions.allowedContracts.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Última atualização: {formatDateTime(lastUpdate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowNFCReader(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Ler NFC
          </Button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: 'Total Funcionários', value: totalStats.totalEmployees, color: 'blue', icon: Users },
          { label: 'Presentes', value: totalStats.present, color: 'green', icon: UserCheck },
          { label: 'Ausentes', value: totalStats.absent, color: 'red', icon: UserX },
          { label: 'Atrasados', value: totalStats.late, color: 'yellow', icon: AlertTriangle },
          { label: 'Saíram', value: totalStats.left, color: 'gray', icon: CheckCircle }
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
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalStats.totalEmployees > 0 ? 
                        `${Math.round((stat.value / totalStats.totalEmployees) * 100)}%` : 
                        '0%'
                      } do total
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar funcionário ou função..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {accessibleContracts.length > 1 && (
                  <option value="all">Todos os Contratos Acessíveis</option>
                )}
                {accessibleContracts.map(contract => (
                  <option key={contract.id} value={contract.id}>
                    {contract.name}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Workforce Cards */}
      <div className="space-y-6">
        {filteredWorkforce.map((contractWorkforce, index) => (
          <motion.div
            key={contractWorkforce.contract.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{contractWorkforce.contract.name}</CardTitle>
                      <p className="text-sm text-gray-500">{contractWorkforce.contract.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {contractWorkforce.present + contractWorkforce.late}/{contractWorkforce.totalAssigned}
                      </p>
                      <p className="text-xs text-gray-500">Presentes/Total</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      (contractWorkforce.present + contractWorkforce.late) === contractWorkforce.totalAssigned ? 'bg-green-500' :
                      (contractWorkforce.present + contractWorkforce.late) > contractWorkforce.totalAssigned * 0.8 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Contract Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <UserCheck className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-900">{contractWorkforce.present}</p>
                    <p className="text-xs text-green-700">Presentes</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-yellow-900">{contractWorkforce.late}</p>
                    <p className="text-xs text-yellow-700">Atrasados</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <UserX className="h-5 w-5 text-red-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-red-900">
                      {contractWorkforce.totalAssigned - contractWorkforce.entries.length}
                    </p>
                    <p className="text-xs text-red-700">Ausentes</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-blue-900">
                      {contractWorkforce.totalAssigned > 0 ? 
                        Math.round(((contractWorkforce.present + contractWorkforce.late) / contractWorkforce.totalAssigned) * 100) : 
                        0
                      }%
                    </p>
                    <p className="text-xs text-blue-700">Presença</p>
                  </div>
                </div>

                {/* Employee List */}
                {contractWorkforce.entries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Funcionário</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Função</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Entrada</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Saída</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Local</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {contractWorkforce.entries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {entry.employeeName.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{entry.employeeName}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-gray-900">{entry.functionName}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {entry.checkInTime.toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              {entry.checkOutTime ? (
                                <div className="flex items-center gap-2">
                                  <Timer className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-900">
                                    {entry.checkOutTime.toLocaleTimeString('pt-BR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{entry.location}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(entry.status)}
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                                  {entry.status === 'present' ? 'Presente' :
                                   entry.status === 'absent' ? 'Ausente' :
                                   entry.status === 'late' ? 'Atrasado' :
                                   'Saiu'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum funcionário registrado hoje</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* NFC Reader Modal */}
      {showNFCReader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Controle de Presença</h3>
              <p className="text-gray-600 mb-6">Aproxime o cartão NFC para registrar entrada/saída</p>
              
              <NFCReader
                onRead={handleNFCRead}
                onStatusChange={setNfcStatus}
                isActive={showNFCReader}
              />

              {nfcStatus === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Registro realizado com sucesso!</span>
                </div>
              )}

              {nfcStatus === 'error' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">Funcionário não encontrado ou sem permissão</span>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNFCReader(false)
                    setNfcStatus('idle')
                  }}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}