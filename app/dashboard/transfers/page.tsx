'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AvatarWithImage as Avatar } from '@/components/ui/avatar';
import { Dialog } from '@/components/ui/dialog';
import { 
  formatDate
} from '@/lib/utils'
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
import { useTransferRequests } from '@/lib/hooks/useTransferRequests';
import { useTransferStats } from '@/lib/hooks/useTransferStats';
import { TransferDetailModal } from './TransferDetailModal';
import { useTransferMutation } from '@/lib/hooks/useTransferMutation';
import { useEmployeesQuery } from '@/lib/useEmployeesQuery';
import { useContractsQuery } from '@/lib/useContracts';
import { format } from 'date-fns';

interface TransferRequest {
  id: string;
  employee: any;
  toContractId: string;
  toFunctionId: string;
  scheduledDate: string;
  status: string;
  requestedBy?: any;
  approvedBy?: any;
  createdAt?: string;
  approvedAt?: string;
  completedAt?: string;
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

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [accessibleContracts, setAccessibleContracts] = useState<any[]>([]) // Assuming mockContracts is removed
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

  const transferMutation = useTransferMutation();

  // Handlers para ações do modal
  const handleApprove = async () => {
    if (!selectedTransfer) return;
    await transferMutation.updateTransfer.mutateAsync({ id: selectedTransfer.id, data: { status: 'APPROVED' } });
    setShowTransferDetails(false);
  };
  const handleComplete = async () => {
    if (!selectedTransfer) return;
    await transferMutation.updateTransfer.mutateAsync({ id: selectedTransfer.id, data: { status: 'COMPLETED', completedAt: new Date().toISOString() } });
    setShowTransferDetails(false);
  };
  const handleReject = async () => {
    if (!selectedTransfer) return;
    await transferMutation.rejectTransfer.mutateAsync(selectedTransfer.id);
    setShowTransferDetails(false);
  };

  // Inicializar usuário e permissões
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)
    
    const contracts = getAccessibleContracts(user, []) // Assuming mockContracts is removed
    setAccessibleContracts(contracts)
  }, []) // Executar apenas uma vez na montagem do componente

  // Filtrar transferências baseado nas permissões
  const accessibleTransfers = useMemo(() => {
    if (!data?.transferRequests || !accessibleContracts.length) return []
    
    return data.transferRequests.filter(transfer => {
      // Verificar se o usuário pode ver transferências dos contratos envolvidos
      const toContractAccess = accessibleContracts.some(c => c.id === transfer.toContractId)
      return toContractAccess
    })
  }, [data?.transferRequests, accessibleContracts])

  useEffect(() => {
    setTransfers(accessibleTransfers)
  }, [accessibleTransfers])

  // Corrigir filtro de transfers:
  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = (
      (transfer.employee?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transfer.toContractId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    const employee = data?.transferRequests.find(transfer => transfer.employee?.nfcCardId === nfcData)?.employee;
    
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

  // Comentar ou remover handlers e lógicas que usam propriedades inexistentes
  // Exemplo:
  // const handleApproveTransfer = (transferId: string) => { ... }
  // const handleRejectTransfer = (transferId: string) => { ... }
  // const handleConfirmContractorSystem = (transferId: string, systemName: string) => { ... }
  // const canUserApproveStep = (transfer: TransferRequest, step: TransferStep): boolean => { ... }
  // (Comente ou remova todo o bloco desses handlers e usos relacionados)

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
    total: data?.transferRequests.length || 0,
    pendingDestination: data?.transferRequests.filter(t => t.status === 'PENDING_DESTINATION_APPROVAL').length || 0,
    pendingAdmin: data?.transferRequests.filter(t => t.status === 'PENDING_ADMIN_APPROVAL').length || 0,
    pendingSystem: data?.transferRequests.filter(t => t.status === 'PENDING_CONTRACTOR_SYSTEM').length || 0,
    pendingRelease: data?.transferRequests.filter(t => t.status === 'PENDING_CONTRACTOR_RELEASE').length || 0,
    completed: data?.transferRequests.filter(t => t.status === 'COMPLETED').length || 0,
  }

  // Exemplo de renderização (resumido):
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Transferências</h1>
        <Button onClick={() => setShowNewTransferModal(true)}>
          Nova Transferência
        </Button>
      </div>
      {/* Cards de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats?.total ?? '-'}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats?.byStatus?.PENDING ?? '-'}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats?.byStatus?.APPROVED ?? '-'}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Últimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats?.recent30Days ?? '-'}</span>
          </CardContent>
        </Card>
      </div>
      {/* Filtros e busca */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <select value={status} onChange={e => setStatus(e.target.value)} className="w-48 px-2 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
          <option value="">Todos os status</option>
          <option value="PENDING">Pendente</option>
          <option value="APPROVED">Aprovada</option>
          <option value="REJECTED">Rejeitada</option>
          <option value="COMPLETED">Concluída</option>
        </select>
        <Input
          placeholder="Buscar por funcionário, contrato..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
      </div>
      {/* Tabela de transferências */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200">Funcionário</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200">Contrato Destino</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200">Função Destino</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200">Data Agendada</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200">Solicitante</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200">Aprovador</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-slate-200">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : isError ? (
              <tr><td colSpan={8} className="text-center py-8 text-red-500">Erro ao carregar transferências</td></tr>
            ) : !data?.transferRequests?.length ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Nenhuma transferência encontrada</td></tr>
            ) : (
              data.transferRequests.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar src={transfer.employee?.avatar || ''} alt={transfer.employee?.name || ''} />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-slate-100">{transfer.employee?.name}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">CPF: {transfer.employee?.cpf}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">Matrícula: {transfer.employee?.registration}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{transfer.toContractId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{transfer.toFunctionId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{transfer.scheduledDate ? new Date(transfer.scheduledDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(transfer.status)}`}>
                      {getStatusIcon(transfer.status)}
                      <span className="ml-1">{getStatusLabel(transfer.status)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{transfer.requestedBy?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{transfer.approvedBy?.name ?? '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedTransfer(transfer); setShowTransferDetails(true); }}>
                      Detalhes
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Paginação */}
      <div className="flex justify-end mt-4 gap-2">
        <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
        <span className="px-2 py-1 text-sm">Página {page} de {data?.pagination?.pages ?? 1}</span>
        <Button size="sm" variant="outline" disabled={page === (data?.pagination?.pages ?? 1)} onClick={() => setPage(p => p + 1)}>Próxima</Button>
      </div>
      {showNewTransferModal && (
        <NewTransferModal open={showNewTransferModal} onClose={() => setShowNewTransferModal(false)} onSuccess={() => {/* refetch transfers */}} currentUser={currentUser} />
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
  const { data: employeesData, isLoading: loadingEmployees } = useEmployeesQuery(employeesQueryParams);
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
      
      // Verificar se o funcionário tem função atual
      if (!selectedEmployee.currentFunctionId) {
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
          toFunctionId: selectedEmployee.currentFunctionId,
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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
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
        </motion.div>
      </div>
    </Dialog>
  );
}