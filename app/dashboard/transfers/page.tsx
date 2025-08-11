'use client'

import { useState, useEffect, useMemo } from 'react'
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
  MessageSquare,
  TrendingUp,
  Activity,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AvatarWithImage as Avatar } from '@/components/ui/avatar';
import { Dialog } from '@/components/ui/dialog';
import { 
  formatDate
} from '@/lib/utils'
import { NFCReader } from '@/components/nfc/nfc-reader'
import { 
  getUserPermissions, 
  validateUserAccess
} from '@/lib/auth-client'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useTransferRequests } from '@/lib/hooks/useTransferRequests';
import { useTransferStats } from '@/lib/hooks/useTransferStats';
import { TransferDetailModal } from './TransferDetailModal';
import { useTransferMutation } from '@/lib/hooks/useTransferMutation';
import { useEmployeesQuery, useEmployeesWithRelationsQuery } from '@/lib/useEmployeesQuery';
import { useContractsQuery } from '@/lib/useContracts';
import { format } from 'date-fns';

interface TransferRequest {
  id: string;
  employee: any;
  fromContractId: string;
  toContractId: string;
  scheduledDate: string;
  status: string;
  requestedBy?: any;
  approvedBy?: any;
  responsibleBy?: any;
  finalizedBy?: any;
  createdAt?: string;
  completedAt?: string;
  
  // Timestamps para métricas
  requestedAt: string;
  approvedAt?: string;
  transferredAt?: string;
  finalizedAt?: string;
  
  // Dados dos contratos
  fromContract?: {
    id: string;
    name: string;
    code: string;
  };
  toContract?: {
    id: string;
    name: string;
    code: string;
  };
}
interface TransferStats {
  total?: number;
  byStatus?: Record<string, number>;
  recent30Days?: number;
  [key: string]: any;
}

export default function TransfersPage() {
  // Filtros e paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');

  // Dados principais
  const transferRequestsParams = useMemo(() => ({ page, limit, status, search }), [page, limit, status, search]);
  const { data, isLoading, isError } = useTransferRequests(transferRequestsParams) as { data?: { transferRequests: TransferRequest[], pagination: any }, isLoading: boolean, isError: boolean };
  const { data: stats, isLoading: loadingStats } = useTransferStats(true) as { data?: TransferStats, isLoading: boolean };

  // Debug: Log dos dados
  console.log('🔍 Debug Transferências:')
  console.log('   isLoading:', isLoading)
  console.log('   isError:', isError)
  console.log('   data:', data)
  console.log('   transferRequests:', data?.transferRequests)
  console.log('   transferRequests.length:', data?.transferRequests?.length)
  console.log('   params:', transferRequestsParams)
  console.log('')

  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [accessibleContracts, setAccessibleContracts] = useState<any[]>([])
  const [transfers, setTransfers] = useState<TransferRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewTransferModal, setShowNewTransferModal] = useState(false)
  const [showNFCReader, setShowNFCReader] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  const [nfcStatus, setNfcStatus] = useState('idle')
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [showTransferDetails, setShowTransferDetails] = useState(false)
  const [showContractorSystemModal, setShowContractorSystemModal] = useState(false)

  // Hook para obter usuário atual
  const { user: currentUser, loading: userLoading } = useCurrentUser()

  // Inicializar permissões quando usuário mudar
  useEffect(() => {
    if (currentUser) {
      const permissions = getUserPermissions(currentUser)
      setUserPermissions(permissions)
    }
  }, [currentUser])

  const handleApprove = async () => {
    // Implementar lógica de aprovação
  }

  const handleComplete = async () => {
    // Implementar lógica de conclusão
  }

  const handleReject = async () => {
    // Implementar lógica de rejeição
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_DESTINATION_APPROVAL':
      case 'PENDING_ADMIN_APPROVAL':
      case 'PENDING_CONTRACTOR_SYSTEM':
      case 'PENDING_CONTRACTOR_RELEASE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_DESTINATION_APPROVAL':
      case 'PENDING_ADMIN_APPROVAL':
      case 'PENDING_CONTRACTOR_SYSTEM':
      case 'PENDING_CONTRACTOR_RELEASE':
        return <Clock className="h-3 w-3" />
      case 'APPROVED':
        return <Check className="h-3 w-3" />
      case 'REJECTED':
        return <X className="h-3 w-3" />
      case 'COMPLETED':
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_DESTINATION_APPROVAL':
        return 'Aguardando Destino'
      case 'PENDING_ADMIN_APPROVAL':
        return 'Aguardando Admin'
      case 'PENDING_CONTRACTOR_SYSTEM':
        return 'Aguardando Sistema'
      case 'PENDING_CONTRACTOR_RELEASE':
        return 'Aguardando Liberação'
      case 'APPROVED':
        return 'Aprovada'
      case 'REJECTED':
        return 'Rejeitada'
      case 'COMPLETED':
        return 'Concluída'
      default:
        return status
    }
  }

  // Funções para calcular tempos de cada etapa
  const calculateTimeDiff = (startDate: string, endDate?: string) => {
    if (!endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    }
    return `${diffMinutes}min`;
  }

  const getProcessTime = (transfer: TransferRequest) => {
    const times = {
      approval: calculateTimeDiff(transfer.requestedAt, transfer.approvedAt),
      transfer: calculateTimeDiff(transfer.approvedAt || transfer.requestedAt, transfer.transferredAt),
      finalization: calculateTimeDiff(transfer.transferredAt || transfer.approvedAt || transfer.requestedAt, transfer.finalizedAt),
      total: calculateTimeDiff(transfer.requestedAt, transfer.finalizedAt)
    };
    
    return times;
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  }

  const handleNFCRead = (nfcData: string) => {
    // Simular busca de funcionário por NFC
    const employee = {
      id: '1',
      name: 'João Silva',
      cpf: '123.456.789-00',
      registration: 'EMP001',
      currentContractId: 'contract-1',
      avatar: ''
    }
    
    if (employee && employee.currentContractId && validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) {
      setSelectedEmployee(employee)
      setNfcStatus('success')
      setShowNFCReader(false)
      setShowNewTransferModal(true)
    } else {
      setNfcStatus('error')
      setTimeout(() => setNfcStatus('idle'), 3000)
    }
  }

  const getRoleDisplayName = (role: any) => {
    switch (role) {
      case 'TENANT_ADMIN': return 'Admin Geral'
      case 'CONTRACT_MANAGER': return 'Gerente de Contrato'
      case 'HR': return 'Recursos Humanos'
      case 'PLANNING': return 'Planejamento'
      case 'SAFETY': return 'Segurança'
      case 'SUPERVISOR': return 'Supervisor'
      case 'OPERATOR': return 'Operador'
      default: return role
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

  const transferStats = {
    total: data?.transferRequests.length || 0,
    pendingDestination: data?.transferRequests.filter(t => t.status === 'PENDING_DESTINATION_APPROVAL').length || 0,
    pendingAdmin: data?.transferRequests.filter(t => t.status === 'PENDING_ADMIN_APPROVAL').length || 0,
    pendingSystem: data?.transferRequests.filter(t => t.status === 'PENDING_CONTRACTOR_SYSTEM').length || 0,
    pendingRelease: data?.transferRequests.filter(t => t.status === 'PENDING_CONTRACTOR_RELEASE').length || 0,
    completed: data?.transferRequests.filter(t => t.status === 'COMPLETED').length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header com Informações de Permissão */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Transferências</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600 dark:text-slate-400">Gestão de transferências de funcionários entre contratos</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {getRoleDisplayName(currentUser.role)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
            <Button size="sm" onClick={() => setShowNewTransferModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transferência
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards Melhorados */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {[
          { 
            label: 'Total Transferências', 
            value: stats?.total ?? 0, 
            color: 'blue', 
            icon: ArrowLeftRight,
            description: 'Todas as transferências'
          },
          { 
            label: 'Pendentes', 
            value: transferStats.pendingDestination + transferStats.pendingAdmin + transferStats.pendingSystem + transferStats.pendingRelease, 
            color: 'yellow', 
            icon: Clock,
            description: 'Aguardando aprovação'
          },
          { 
            label: 'Aprovadas', 
            value: stats?.byStatus?.APPROVED ?? 0, 
            color: 'green', 
            icon: CheckCircle,
            description: 'Transferências aprovadas'
          },
          { 
            label: 'Concluídas', 
            value: transferStats.completed, 
            color: 'purple', 
            icon: Target,
            description: 'Transferências finalizadas'
          },
          { 
            label: 'Rejeitadas', 
            value: stats?.byStatus?.REJECTED ?? 0, 
            color: 'red', 
            icon: X,
            description: 'Transferências rejeitadas'
          },
          { 
            label: 'Últimos 30 dias', 
            value: stats?.recent30Days ?? 0, 
            color: 'orange', 
            icon: TrendingUp,
            description: 'Transferências recentes'
          }
        ].map((stat, index) => (
          <div key={stat.label} className="transition-all duration-300 ease-in-out">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                    stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                    stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                    stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                    'bg-orange-100 dark:bg-orange-900/20'
                  }`}>
                    <stat.icon className={`h-5 w-5 ${
                      stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                      'text-orange-600 dark:text-orange-400'
                    }`} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Filtros e Busca Melhorados */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por funcionário, contrato ou função..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)} 
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              >
                <option value="">Todos os status</option>
                <option value="PENDING_DESTINATION_APPROVAL">Aguardando Destino</option>
                <option value="PENDING_ADMIN_APPROVAL">Aguardando Admin</option>
                <option value="PENDING_CONTRACTOR_SYSTEM">Aguardando Sistema</option>
                <option value="PENDING_CONTRACTOR_RELEASE">Aguardando Liberação</option>
                <option value="APPROVED">Aprovada</option>
                <option value="REJECTED">Rejeitada</option>
                <option value="COMPLETED">Concluída</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela Melhorada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Lista de Transferências ({data?.transferRequests?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr className="bg-gray-50 dark:bg-slate-800">
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Funcionário</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Transferência</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Data Agendada</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Solicitante</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Aprovador</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Responsável por Transferir</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Finalizado por</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500 dark:text-slate-400">Carregando transferências...</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex items-center justify-center space-x-2 text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Erro ao carregar transferências</span>
                      </div>
                    </td>
                  </tr>
                ) : !data?.transferRequests?.length ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-2">
                        <ArrowLeftRight className="h-12 w-12 text-gray-400 dark:text-slate-500" />
                        <span className="text-gray-500 dark:text-slate-400">Nenhuma transferência encontrada</span>
                        <p className="text-sm text-gray-400 dark:text-slate-500">Crie uma nova transferência para começar</p>
                        {/* Debug info */}
                        <div className="text-xs text-red-500 mt-2">
                          Debug: data={JSON.stringify(!!data)}, 
                          transferRequests={JSON.stringify(!!data?.transferRequests)}, 
                          length={JSON.stringify(data?.transferRequests?.length)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.transferRequests.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={transfer.employee?.avatar || ''} alt={transfer.employee?.name || ''} />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-slate-100">{transfer.employee?.name}</div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">CPF: {transfer.employee?.cpf}</div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">Matrícula: {transfer.employee?.registration}</div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">Função: {transfer.employee?.currentFunction?.name || transfer.employee?.companyFunction?.name || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-gray-900 dark:text-slate-100">
                              <strong>DE:</strong> {transfer.fromContract?.name || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowDownRight className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-900 dark:text-slate-100">
                              <strong>PARA:</strong> {transfer.toContract?.name || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                          <span className="text-sm text-gray-900 dark:text-slate-100">
                            {transfer.scheduledDate ? format(new Date(transfer.scheduledDate), 'dd/MM/yyyy') : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full shadow-sm ${getStatusColor(transfer.status)}`}>
                          {getStatusIcon(transfer.status)}
                          <span className="ml-1">{getStatusLabel(transfer.status)}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                          <div>
                            <span className="text-sm text-gray-900 dark:text-slate-100">{transfer.requestedBy?.name || '-'}</span>
                            <div className="text-xs text-gray-500 dark:text-slate-400">
                              {formatDateTime(transfer.requestedAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                          <div>
                            <span className="text-sm text-gray-900 dark:text-slate-100">{transfer.approvedBy?.name || '-'}</span>
                            {transfer.approvedAt && (
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {formatDateTime(transfer.approvedAt)}
                                {getProcessTime(transfer).approval && (
                                  <span className="ml-1 text-green-600">({getProcessTime(transfer).approval})</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                          <div>
                            <span className="text-sm text-gray-900 dark:text-slate-100">{transfer.responsibleBy?.name || '-'}</span>
                            {transfer.transferredAt && (
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {formatDateTime(transfer.transferredAt)}
                                {getProcessTime(transfer).transfer && (
                                  <span className="ml-1 text-blue-600">({getProcessTime(transfer).transfer})</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                          <div>
                            <span className="text-sm text-gray-900 dark:text-slate-100">{transfer.finalizedBy?.name || '-'}</span>
                            {transfer.finalizedAt && (
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {formatDateTime(transfer.finalizedAt)}
                                {getProcessTime(transfer).finalization && (
                                  <span className="ml-1 text-purple-600">({getProcessTime(transfer).finalization})</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => { setSelectedTransfer(transfer); setShowTransferDetails(true); }}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                          {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginação Melhorada */}
      {data?.pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, data.pagination.total)} de {data.pagination.total} transferências
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-slate-800 rounded-md">
              Página {page} de {data.pagination.pages}
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              disabled={page === data.pagination.pages} 
              onClick={() => setPage(p => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Modais */}
      {showNewTransferModal && (
        <NewTransferModal 
          open={showNewTransferModal} 
          onClose={() => setShowNewTransferModal(false)} 
          onSuccess={() => {/* refetch transfers */}} 
          currentUser={currentUser} 
        />
      )}
      <TransferDetailModal
        isOpen={showTransferDetails}
        onClose={() => setShowTransferDetails(false)}
        transfer={selectedTransfer}
        onApprove={handleApprove}
        onReject={handleReject}
        onComplete={handleComplete}
      />
    </div>
  );
}

function NewTransferModal({ open, onClose, onSuccess, currentUser }: { open: boolean, onClose: () => void, onSuccess: () => void, currentUser: any }) {
  const [step, setStep] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const employeesQueryParams = useMemo(() => ({ isActive: true, limit: 50 }), []);
  const { data: employeesData, isLoading: loadingEmployees } = useEmployeesWithRelationsQuery(employeesQueryParams);
  const contractsQueryParams = useMemo(() => ({}), []);
  const { data: contractsData, isLoading: loadingContracts } = useContractsQuery(contractsQueryParams);
  


  const employees = employeesData?.employees || [];
  const contracts = contractsData?.contracts || [];

  const reset = () => {
    setStep(0);
    setSelectedEmployee(null);
    setSelectedContractId('');
    setScheduledDate('');
    setError('');
  };

  useEffect(() => { if (!open) reset(); }, [open]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!currentUser?.id) {
        setError('Usuário não autenticado. Faça login novamente.');
        return;
      }
      
      if (!scheduledDate) {
        setError('Data agendada é obrigatória.');
        return;
      }
      
      if (!selectedContractId) {
        setError('Contrato de destino é obrigatório.');
        return;
      }
      
      if (!selectedEmployee?.id) {
        setError('Funcionário é obrigatório.');
        return;
      }
      
      // Verificar se o funcionário tem função atual (pode ser currentFunctionId ou companyFunctionId)
      if (!selectedEmployee.currentFunctionId && !selectedEmployee.companyFunctionId) {
        setError('Funcionário não possui função atual definida. É necessário definir uma função atual antes de criar uma transferência.');
        return;
      }
      

      
      // Chamada para criar transferência
      const res = await fetch('/api/transfer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          toContractId: selectedContractId,
          toFunctionId: selectedEmployee.currentFunctionId || selectedEmployee.companyFunctionId,
          scheduledDate,
          requestedById: currentUser?.id,
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(errorData.error || errorData.details || 'Erro ao criar transferência');
      }
      
      const result = await res.json();
      
      onSuccess();
      onClose();
    } catch (e: any) {
      console.error('Erro ao criar transferência:', e);
      setError(e.message || 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Nova Transferência</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Steps */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              {[0,1,2].map((s) => (
                <div key={s} className={`w-8 h-2 rounded-full ${step >= s ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
              ))}
            </div>
            {step === 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Selecione o Funcionário</h3>
                <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
                  {loadingEmployees ? <div className="p-4 text-center">Carregando...</div> : employees.map(emp => (
                    <div key={emp.id} className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-primary/10 ${selectedEmployee?.id === emp.id ? 'bg-primary/10' : ''}`} onClick={() => setSelectedEmployee(emp)}>
                      <Avatar src={emp.avatar || ''} alt={emp.name || ''} />
                      <div>
                        <div className="font-semibold">{emp.name}</div>
                        <div className="text-xs text-gray-500">ID: {emp.id}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => selectedEmployee && setStep(1)} disabled={!selectedEmployee}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}
            {step === 1 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Dados da Transferência</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Funcionário</label>
                    <div className="flex items-center gap-2">
                      <Avatar src={selectedEmployee?.avatar || ''} alt={selectedEmployee?.name || ''} />
                      <span className="font-semibold">{selectedEmployee?.name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Função</label>
                    <p className="text-sm text-gray-900 dark:text-slate-100">
                      {selectedEmployee?.currentFunction?.name || selectedEmployee?.companyFunction?.name || 'Função não definida'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Contrato Destino *</label>
                    <select className="w-full px-2 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900" value={selectedContractId} onChange={e => setSelectedContractId(e.target.value)}>
                      <option value="">Selecione...</option>
                      {loadingContracts ? <option>Carregando...</option> : contracts.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Data Agendada *</label>
                    <div className="flex items-center gap-2">
                      <input type="date" className="w-full px-2 py-2 rounded border border-gray-300 dark:border-slate-700" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(0)}>Voltar</Button>
                  <Button 
                    onClick={() => {
                      const hasRequiredFields = selectedContractId && scheduledDate;
                      
                      if (hasRequiredFields) {
                        setStep(2);
                      } else {
                        setError('Preencha todos os campos obrigatórios');
                      }
                    }} 
                    disabled={!selectedContractId || !scheduledDate}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Revisar e Confirmar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Funcionário</label>
                    <div className="flex items-center gap-2">
                      <Avatar src={selectedEmployee?.avatar || ''} alt={selectedEmployee?.name || ''} />
                      <span className="font-semibold">{selectedEmployee?.name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Função</label>
                    <p className="text-sm text-gray-900 dark:text-slate-100">
                      {selectedEmployee?.currentFunction?.name || selectedEmployee?.companyFunction?.name || 'Função não definida'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Contrato Destino</label>
                    <p className="text-sm text-gray-900 dark:text-slate-100">{contracts.find(c => c.id === selectedContractId)?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Data Agendada</label>
                    <p className="text-sm text-gray-900 dark:text-slate-100">{scheduledDate ? format(new Date(scheduledDate), 'PPP') : '-'}</p>
                  </div>
                </div>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Salvando...' : 'Confirmar'}</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}