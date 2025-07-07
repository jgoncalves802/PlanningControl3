'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Eye,
  Check,
  X,
  Clock,
  User as UserIcon,
  Building,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle,
  Shield,
  FileText,
  Settings,
  ArrowRight,
  Building2,
  Users,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  mockTransferRequests, 
  mockEmployees, 
  mockContracts, 
  TransferStatus, 
  TransferStep,
  TransferRequest, 
  Employee,
  Contract
} from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import { NFCReader } from '@/components/nfc/nfc-reader'
import { 
  getCurrentUser, 
  getUserPermissions, 
  getAccessibleContracts, 
  canUserAccessContract,
  validateUserAccess,
  User,
  UserRole
} from '@/lib/auth'

export default function TransfersPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [accessibleContracts, setAccessibleContracts] = useState<Contract[]>([])
  const [transfers, setTransfers] = useState<TransferRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewTransferModal, setShowNewTransferModal] = useState(false)
  const [showNFCReader, setShowNFCReader] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [nfcStatus, setNfcStatus] = useState('idle')
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null)
  const [showTransferDetails, setShowTransferDetails] = useState(false)
  const [showContractorSystemModal, setShowContractorSystemModal] = useState(false)

  // Inicializar usuário e permissões
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)
    
    const contracts = getAccessibleContracts(user, mockContracts)
    setAccessibleContracts(contracts)
    
    // Filtrar transferências baseado nas permissões
    const accessibleTransfers = mockTransferRequests.filter(transfer => {
      // Verificar se o usuário pode ver transferências dos contratos envolvidos
      const fromContractAccess = contracts.some(c => c.id === transfer.fromContractId)
      const toContractAccess = contracts.some(c => c.id === transfer.toContractId)
      return fromContractAccess || toContractAccess
    })
    
    setTransfers(accessibleTransfers)
  }, [])

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromContract.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toContract.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_DESTINATION_APPROVAL': return 'bg-yellow-100 text-yellow-800'
      case 'PENDING_ADMIN_APPROVAL': return 'bg-blue-100 text-blue-800'
      case 'PENDING_CONTRACTOR_SYSTEM': return 'bg-purple-100 text-purple-800'
      case 'PENDING_CONTRACTOR_RELEASE': return 'bg-orange-100 text-orange-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_DESTINATION_APPROVAL': return <Clock className="h-4 w-4" />
      case 'PENDING_ADMIN_APPROVAL': return <Users className="h-4 w-4" />
      case 'PENDING_CONTRACTOR_SYSTEM': return <Settings className="h-4 w-4" />
      case 'PENDING_CONTRACTOR_RELEASE': return <Building2 className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <X className="h-4 w-4" />
      case 'CANCELLED': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_DESTINATION_APPROVAL': return 'Aguardando Aprovação Destino'
      case 'PENDING_ADMIN_APPROVAL': return 'Aguardando Aprovação ADM'
      case 'PENDING_CONTRACTOR_SYSTEM': return 'Aguardando Sistema Contratada'
      case 'PENDING_CONTRACTOR_RELEASE': return 'Aguardando Liberação Contratante'
      case 'COMPLETED': return 'Concluído'
      case 'REJECTED': return 'Rejeitado'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const handleNFCRead = (nfcData: string) => {
    const employee = mockEmployees.find(emp => emp.nfcCardId === nfcData)
    
    if (employee && employee.currentContractId && canUserAccessContract(currentUser!, employee.currentContractId)) {
      setSelectedEmployee(employee)
      setNfcStatus('success')
      setShowNFCReader(false)
      setShowNewTransferModal(true)
    } else {
      setNfcStatus('error')
      setTimeout(() => setNfcStatus('idle'), 3000)
    }
  }

  const handleApproveTransfer = (transferId: string) => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    setTransfers(prev => prev.map(transfer => {
      if (transfer.id === transferId) {
        const updatedTransfer = { ...transfer }
        const now = new Date()
        
        // Adicionar aprovação ao histórico
        const newApproval = {
          id: `approval-${Date.now()}`,
          step: transfer.currentStep,
          approvedBy: currentUser!.name,
          approvedByRole: currentUser!.role,
          approvedAt: now,
          action: 'APPROVED' as const,
          comments: ''
        }
        
        updatedTransfer.approvalHistory = [...transfer.approvalHistory, newApproval]
        
        // Avançar para próxima etapa
        switch (transfer.currentStep) {
          case TransferStep.DESTINATION_APPROVAL:
            updatedTransfer.status = TransferStatus.PENDING_ADMIN_APPROVAL
            updatedTransfer.currentStep = TransferStep.ADMIN_APPROVAL
            break
          case TransferStep.ADMIN_APPROVAL:
            updatedTransfer.status = TransferStatus.PENDING_CONTRACTOR_SYSTEM
            updatedTransfer.currentStep = TransferStep.CONTRACTOR_SYSTEM
            break
          case TransferStep.CONTRACTOR_RELEASE:
            updatedTransfer.status = TransferStatus.COMPLETED
            updatedTransfer.currentStep = TransferStep.COMPLETED
            updatedTransfer.completedAt = now
            break
        }
        
        return updatedTransfer
      }
      return transfer
    }))
  }

  const handleRejectTransfer = (transferId: string) => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return
    
    setTransfers(prev => prev.map(transfer => {
      if (transfer.id === transferId) {
        const updatedTransfer = { ...transfer }
        const now = new Date()
        
        // Adicionar rejeição ao histórico
        const newApproval = {
          id: `approval-${Date.now()}`,
          step: transfer.currentStep,
          approvedBy: currentUser!.name,
          approvedByRole: currentUser!.role,
          approvedAt: now,
          action: 'REJECTED' as const,
          comments: 'Rejeitado pelo usuário'
        }
        
        updatedTransfer.approvalHistory = [...transfer.approvalHistory, newApproval]
        updatedTransfer.status = TransferStatus.REJECTED
        
        return updatedTransfer
      }
      return transfer
    }))
  }

  const handleConfirmContractorSystem = (transferId: string, systemName: string) => {
    setTransfers(prev => prev.map(transfer => {
      if (transfer.id === transferId) {
        const updatedTransfer = { ...transfer }
        updatedTransfer.contractorSystemConfirmed = true
        updatedTransfer.contractorSystemName = systemName
        updatedTransfer.contractorSystemConfirmedBy = currentUser!.name
        updatedTransfer.contractorSystemConfirmedAt = new Date()
        updatedTransfer.status = TransferStatus.PENDING_CONTRACTOR_RELEASE
        updatedTransfer.currentStep = TransferStep.CONTRACTOR_RELEASE
        return updatedTransfer
      }
      return transfer
    }))
    setShowContractorSystemModal(false)
  }

  const canUserApproveStep = (transfer: TransferRequest, step: TransferStep): boolean => {
    if (!currentUser) return false
    
    switch (step) {
      case TransferStep.DESTINATION_APPROVAL:
        // Gestor/Planejador do contrato destino
        return (currentUser.role === UserRole.CONTRACT_MANAGER || currentUser.role === UserRole.PLANNING) &&
               canUserAccessContract(currentUser, transfer.toContractId)
      
      case TransferStep.ADMIN_APPROVAL:
        // ADM (HR ou TENANT_ADMIN)
        return currentUser.role === UserRole.HR || currentUser.role === UserRole.TENANT_ADMIN
      
      case TransferStep.CONTRACTOR_SYSTEM:
        // ADM pode confirmar sistema da contratada
        return currentUser.role === UserRole.HR || currentUser.role === UserRole.TENANT_ADMIN
      
      case TransferStep.CONTRACTOR_RELEASE:
        // ADM ou Planejador do contrato recebedor
        return (currentUser.role === UserRole.HR || currentUser.role === UserRole.TENANT_ADMIN) ||
               (currentUser.role === UserRole.PLANNING && canUserAccessContract(currentUser, transfer.toContractId))
      
      default:
        return false
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

  const transferStats = {
    total: transfers.length,
    pendingDestination: transfers.filter(t => t.status === TransferStatus.PENDING_DESTINATION_APPROVAL).length,
    pendingAdmin: transfers.filter(t => t.status === TransferStatus.PENDING_ADMIN_APPROVAL).length,
    pendingSystem: transfers.filter(t => t.status === TransferStatus.PENDING_CONTRACTOR_SYSTEM).length,
    pendingRelease: transfers.filter(t => t.status === TransferStatus.PENDING_CONTRACTOR_RELEASE).length,
    completed: transfers.filter(t => t.status === TransferStatus.COMPLETED).length,
  }

  return (
    <div className="space-y-6">
      {/* Header com Informações de Permissão */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transferências</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Gerencie transferências de funcionários entre contratos</p>
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
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowNFCReader(true)}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Ler NFC
          </Button>
          {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
            <Button size="sm" onClick={() => setShowNewTransferModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transferência
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {[
          { label: 'Total', value: transferStats.total, color: 'blue', icon: ArrowLeftRight },
          { label: 'Aguard. Destino', value: transferStats.pendingDestination, color: 'yellow', icon: Clock },
          { label: 'Aguard. ADM', value: transferStats.pendingAdmin, color: 'purple', icon: Users },
          { label: 'Aguard. Sistema', value: transferStats.pendingSystem, color: 'orange', icon: Settings },
          { label: 'Aguard. Liberação', value: transferStats.pendingRelease, color: 'red', icon: Building2 },
          { label: 'Concluídas', value: transferStats.completed, color: 'green', icon: CheckCircle }
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

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por funcionário, contrato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="PENDING_DESTINATION_APPROVAL">Aguardando Destino</option>
                <option value="PENDING_ADMIN_APPROVAL">Aguardando ADM</option>
                <option value="PENDING_CONTRACTOR_SYSTEM">Aguardando Sistema</option>
                <option value="PENDING_CONTRACTOR_RELEASE">Aguardando Liberação</option>
                <option value="COMPLETED">Concluído</option>
                <option value="REJECTED">Rejeitado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Transferências ({filteredTransfers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Funcionário</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">De</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Para</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Solicitado por</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Data Agendada</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transfer.employeeName}</p>
                            <p className="text-xs text-gray-500">ID: {transfer.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{transfer.fromContract}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{transfer.toContract}</span>
                          </div>
                          <p className="text-xs text-gray-500">{transfer.toFunction}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="text-sm text-gray-900">{transfer.requestedBy}</span>
                          <p className="text-xs text-gray-500">{getRoleDisplayName(transfer.requestedByRole)}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{formatDate(transfer.scheduledDate)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transfer.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transfer.status)}`}>
                            {getStatusLabel(transfer.status)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {/* Ações baseadas no status e permissões */}
                          {transfer.status === TransferStatus.PENDING_CONTRACTOR_SYSTEM && 
                           canUserApproveStep(transfer, TransferStep.CONTRACTOR_SYSTEM) && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedTransfer(transfer)
                                setShowContractorSystemModal(true)
                              }}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {(transfer.status === TransferStatus.PENDING_DESTINATION_APPROVAL ||
                            transfer.status === TransferStatus.PENDING_ADMIN_APPROVAL ||
                            transfer.status === TransferStatus.PENDING_CONTRACTOR_RELEASE) && 
                           canUserApproveStep(transfer, transfer.currentStep) && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleApproveTransfer(transfer.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRejectTransfer(transfer.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedTransfer(transfer)
                              setShowTransferDetails(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Transfer Details Modal */}
      {showTransferDetails && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Detalhes da Transferência</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowTransferDetails(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Informações do Funcionário</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nome:</span>
                      <span className="font-medium">{selectedTransfer.employeeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">{selectedTransfer.employeeId}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Detalhes da Transferência</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Solicitado por:</span>
                      <span className="font-medium">{selectedTransfer.requestedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Agendada:</span>
                      <span className="font-medium">{formatDate(selectedTransfer.scheduledDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTransfer.status)}`}>
                        {getStatusLabel(selectedTransfer.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contratos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Contrato de Origem</h4>
                  <p className="text-sm text-red-800">{selectedTransfer.fromContract}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Contrato de Destino</h4>
                  <p className="text-sm text-green-800">{selectedTransfer.toContract}</p>
                  <p className="text-xs text-green-700 mt-1">Função: {selectedTransfer.toFunction}</p>
                </div>
              </div>

              {/* Motivo */}
              {selectedTransfer.reason && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Motivo da Transferência</h4>
                  <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">{selectedTransfer.reason}</p>
                </div>
              )}

              {/* Sistema da Contratada */}
              {selectedTransfer.contractorSystemConfirmed && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Sistema da Contratada</h4>
                  <div className="text-sm text-blue-800">
                    <p>Sistema: {selectedTransfer.contractorSystemName}</p>
                    <p>Confirmado por: {selectedTransfer.contractorSystemConfirmedBy}</p>
                    <p>Data: {selectedTransfer.contractorSystemConfirmedAt && formatDate(selectedTransfer.contractorSystemConfirmedAt)}</p>
                  </div>
                </div>
              )}

              {/* Histórico de Aprovações */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Histórico de Aprovações</h4>
                <div className="space-y-3">
                  {selectedTransfer.approvalHistory.map((approval, index) => (
                    <div key={approval.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${approval.action === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {approval.action === 'APPROVED' ? 
                          <Check className="h-4 w-4 text-green-600" /> : 
                          <X className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {approval.step === TransferStep.DESTINATION_APPROVAL ? 'Aprovação Destino' :
                             approval.step === TransferStep.ADMIN_APPROVAL ? 'Aprovação ADM' :
                             approval.step === TransferStep.CONTRACTOR_RELEASE ? 'Liberação Contratante' :
                             approval.step}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(approval.approvedAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{approval.approvedBy} - {getRoleDisplayName(approval.approvedByRole)}</p>
                        {approval.comments && (
                          <p className="text-xs text-gray-600 mt-1">{approval.comments}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Contractor System Modal */}
      {showContractorSystemModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirmar Sistema da Contratada</h3>
              <p className="text-gray-600 mb-6">
                Confirme que a transferência foi realizada no sistema da contratada
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Sistema
                </label>
                <input
                  type="text"
                  defaultValue={mockContracts.find(c => c.id === selectedTransfer.toContractId)?.contractorSystem || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ex: Sistema ABC Works"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowContractorSystemModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleConfirmContractorSystem(
                    selectedTransfer.id, 
                    mockContracts.find(c => c.id === selectedTransfer.toContractId)?.contractorSystem || 'Sistema da Contratada'
                  )}
                  className="flex-1"
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Leitor NFC</h3>
              <p className="text-gray-600 mb-6">Aproxime o cartão NFC do funcionário</p>
              
              <NFCReader
                onRead={handleNFCRead}
                onStatusChange={setNfcStatus}
                isActive={showNFCReader}
              />

              {nfcStatus === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Funcionário identificado com sucesso!</span>
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

      {/* New Transfer Modal */}
      {showNewTransferModal && validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Nova Transferência</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowNewTransferModal(false)
                  setSelectedEmployee(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {selectedEmployee && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Funcionário identificado via NFC</p>
                    <p className="text-sm text-green-700">{selectedEmployee.name} - {selectedEmployee.cpf}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funcionário
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    defaultValue={selectedEmployee?.id || ''}
                  >
                    <option value="">Selecione um funcionário</option>
                    {mockEmployees.filter(emp => 
                      emp.currentContractId && canUserAccessContract(currentUser, emp.currentContractId)
                    ).map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {typeof emp.currentContract === 'string' ? emp.currentContract : emp.currentContract?.name || 'Sem contrato'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contrato de Destino
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="">Selecione um contrato</option>
                    {accessibleContracts.map(contract => (
                      <option key={contract.id} value={contract.id}>
                        {contract.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Função de Destino
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="">Selecione uma função</option>
                    <option value="engineer">Engenheiro</option>
                    <option value="operator">Operador</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Agendada
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da Transferência
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Descreva o motivo da transferência..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewTransferModal(false)
                    setSelectedEmployee(null)
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button className="flex-1">
                  Solicitar Transferência
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}