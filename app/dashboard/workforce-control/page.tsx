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
  EyeOff,
  Loader2,
  History,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import NFCReadModal from '@/components/nfc/NFCReadModal'
import { useWorkforceRealTime, useProcessNFC } from '@/lib/useWorkforce'
import { useContractsQuery } from '@/lib/useContracts'
import { useFunctionsQuery } from '@/lib/useFunctions'
import { WorkforceFilters } from '@/lib/types/workforce'
import { 
  getCurrentUser, 
  getUserPermissions, 
  getAccessibleContracts, 
  canUserAccessContract,
  User,
  UserRole
} from '@/lib/auth'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MultiSelect } from '@/components/ui/multiselect';
import { useRef } from 'react'
import { useDebounce } from '@/lib/hooks/useDebounce'

export default function WorkforceControlPage() {
  // TODOS OS HOOKS DEVEM FICAR AQUI, no topo do componente
  const currentUser = getCurrentUser();
  const userPermissions = getUserPermissions(currentUser);
  const [selectedContract, setSelectedContract] = useState<string>('all');
  const [showNFCReader, setShowNFCReader] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nfcStatus, setNfcStatus] = useState('idle');
  const [nfcReadValue, setNfcReadValue] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [pointHistoryModalOpen, setPointHistoryModalOpen] = useState(false);
  const [pointHistoryLogs, setPointHistoryLogs] = useState<any[]>([]);
  const [pointHistoryLoading, setPointHistoryLoading] = useState(false);
  const [pointHistoryEmployee, setPointHistoryEmployee] = useState<{ id: string, name: string } | null>(null);
  const [pointHistorySearch, setPointHistorySearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterFunction, setFilterFunction] = useState<string[]>([]);
  const [filterLocation, setFilterLocation] = useState('');
  // Estado para filtros de horário
  const [filterCheckInFrom, setFilterCheckInFrom] = useState('');
  const [filterCheckInTo, setFilterCheckInTo] = useState('');
  // Estado para filtros de horário de saída
  const [filterCheckOutFrom, setFilterCheckOutFrom] = useState('');
  const [filterCheckOutTo, setFilterCheckOutTo] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { data: functionsList } = useFunctionsQuery({ isActive: true });
  const { data: contractsData } = useContractsQuery();
  const contracts = contractsData?.contracts || [];

  // Debounced values
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const debouncedCheckInFrom = useDebounce(filterCheckInFrom, 400);
  const debouncedCheckInTo = useDebounce(filterCheckInTo, 400);
  const debouncedCheckOutFrom = useDebounce(filterCheckOutFrom, 400);
  const debouncedCheckOutTo = useDebounce(filterCheckOutTo, 400);

  const filters: any = {
    contractId: selectedContract === 'all' ? undefined : selectedContract,
    search: debouncedSearchTerm || undefined,
    dateRange: {
      from: selectedDate,
      to: selectedDate
    },
    status: filterStatus.length > 0 ? filterStatus : undefined,
    functionIds: filterFunction.length > 0 ? filterFunction : undefined,
    location: filterLocation || undefined,
    checkInTimeFrom: debouncedCheckInFrom || undefined,
    checkInTimeTo: debouncedCheckInTo || undefined,
    checkOutTimeFrom: debouncedCheckOutFrom || undefined,
    checkOutTimeTo: debouncedCheckOutTo || undefined,
  };
  const safePage = currentPage < 1 ? 1 : currentPage;
  const { entries, stats, isLoading, error, refetch, page, totalPages, total, limit } = useWorkforceRealTime(filters, safePage, pageSize);
  const processNFCMutation = useProcessNFC();
  const contractGroups = entries?.contractGroups || [];
  const accessibleContracts = currentUser ? getAccessibleContracts(currentUser, contracts) : [];
  const allEntryIds = contractGroups.flatMap(group => group.entries.map(entry => entry.id));
  const isAllSelected = allEntryIds.length > 0 && allEntryIds.every(id => selectedRows.includes(id));
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    if (accessibleContracts.length === 1 && selectedContract === 'all') {
      setSelectedContract(accessibleContracts[0].id)
    }
  }, [accessibleContracts, selectedContract])

  useEffect(() => {
    if (processNFCMutation.isError) {
      console.error('[NFC] Erro na mutação:', processNFCMutation.error)
    }
    if (processNFCMutation.isSuccess) {
      console.log('[NFC] Mutação de registro de ponto bem-sucedida:', processNFCMutation.data)
      refetch(); // Atualiza a tabela após registro
    }
  }, [processNFCMutation.isError, processNFCMutation.isSuccess])

  // Fechar feedback automaticamente após sucesso/erro
  useEffect(() => {
    if (processNFCMutation.isSuccess || processNFCMutation.isError) {
      const timeout = setTimeout(() => {
        processNFCMutation.reset()
        setShowNFCReader(false)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [processNFCMutation.isSuccess, processNFCMutation.isError])

  // Função precisa estar antes dos returns condicionais
  const refreshData = () => {
    refetch()
  }

  // Função para resetar todos os filtros
  const clearAllFilters = () => {
    setSelectedContract('all');
    setSearchTerm('');
    setSelectedDate(new Date());
    setFilterStatus([]);
    setFilterFunction([]);
    setFilterLocation('');
    setFilterCheckInFrom('');
    setFilterCheckInTo('');
    setFilterCheckOutFrom('');
    setFilterCheckOutTo('');
  };

  // Contador de filtros ativos
  const activeFiltersCount = [
    selectedContract !== 'all',
    !!searchTerm,
    filterStatus.length > 0,
    filterFunction.length > 0,
    !!filterLocation,
    !!filterCheckInFrom,
    !!filterCheckInTo,
    !!filterCheckOutFrom,
    !!filterCheckOutTo
  ].filter(Boolean).length;

  // [2] Só depois dos hooks, os returns condicionais:
  if (!currentUser || !userPermissions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <span className="text-gray-600">Carregando usuário...</span>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <span className="text-gray-600">Carregando dados de efetivo...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600">Erro ao carregar dados de efetivo</p>
          <p className="text-sm text-gray-500 mt-2">
            {error?.message || 'Erro desconhecido'}
          </p>
          <Button onClick={refreshData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  // Teste simples para debug
  if (!entries) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">DEBUG: entries é undefined</p>
          <pre className="text-xs mt-2">{JSON.stringify({ entries, stats, isLoading, error }, null, 2)}</pre>
        </div>
      </div>
    )
  }

  const handleNFCRead = async (nfcData: string) => {
    try {
      console.log('[NFC] Valor lido:', nfcData)
      setNfcReadValue(nfcData)
      setNfcStatus('processing')
      
      await processNFCMutation.mutateAsync({
        nfcCardId: nfcData,
        timestamp: new Date(),
        location: `Setor ${Math.floor(Math.random() * 5) + 1}`,
        action: 'check_in' // A API determinará se é check-in ou check-out
      })
      
      setNfcStatus('success')
      
      setTimeout(() => {
        setShowNFCReader(false)
        setNfcStatus('idle')
        setNfcReadValue(null)
      }, 2000)
      
    } catch (error) {
      setNfcStatus('error')
      setTimeout(() => setNfcStatus('idle'), 3000)
    }
  }

  const exportData = async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const params = new URLSearchParams();
      if (selectedContract && selectedContract !== 'all') params.append('contractId', selectedContract);
      if (selectedDate) params.append('date', selectedDate.toISOString().split('T')[0]);
      if (searchTerm) params.append('search', searchTerm);
      params.append('format', format);
      // status pode ser adicionado se houver filtro de status
      const url = `/api/workforce/export?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao exportar dados');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = format === 'xlsx' ? 'efetivo.xlsx' : 'efetivo.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Exportação concluída!');
    } catch (err) {
      toast.error('Erro ao exportar dados');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 border-green-200'
      case 'ABSENT': return 'bg-red-100 text-red-800 border-red-200'
      case 'LATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LEFT': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <UserCheck className="h-4 w-4 text-green-600" />
      case 'ABSENT': return <UserX className="h-4 w-4 text-red-600" />
      case 'LATE': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'LEFT': return <CheckCircle className="h-4 w-4 text-gray-600" />
      default: return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'Presente'
      case 'ABSENT': return 'Ausente'
      case 'LATE': return 'Atrasado'
      case 'LEFT': return 'Saiu'
      default: return status
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

  const formatTime = (dateValue: any): string => {
    if (!dateValue || dateValue === 'null' || dateValue === null || dateValue === undefined) {
      return ''
    }
    
    try {
      // Se já é um objeto Date
      if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? '' : dateValue.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      
      // Se é uma string, tentar converter
      const date = new Date(dateValue)
      return isNaN(date.getTime()) ? '' : date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch (error) {
      console.warn('Erro ao formatar horário:', error, dateValue)
      return ''
    }
  }

  // Feedback visual customizado para NFC
  const getNFCFeedback = (mutation) => {
    if (mutation.isSuccess && mutation.data) {
      const { action, status, isLate } = mutation.data
      if (action === 'check_in') {
        if (status === 'LATE' || isLate) {
          return { type: 'warning', message: 'Check-in realizado (ATRASADO)' }
        }
        return { type: 'success', message: 'Check-in realizado com sucesso!' }
      }
      if (action === 'check_out') {
        return { type: 'success', message: 'Check-out realizado com sucesso!' }
      }
      return { type: 'success', message: 'Registro realizado com sucesso!' }
    }
    if (mutation.isError && mutation.error) {
      return { type: 'error', message: mutation.error.message }
    }
    return null
  }

  const openAuditModal = async (entryId: string) => {
    setSelectedEntryId(entryId)
    setAuditModalOpen(true)
    setAuditLoading(true)
    try {
      const res = await fetch(`/api/audit-logs?entityId=${entryId}`)
      const logs = await res.json()
      setAuditLogs(logs)
    } catch (e) {
      setAuditLogs([])
    } finally {
      setAuditLoading(false)
    }
  }

  const openPointHistoryModal = async (employeeId: string, employeeName: string) => {
    setPointHistoryEmployee({ id: employeeId, name: employeeName })
    setPointHistoryModalOpen(true)
    setPointHistoryLoading(true)
    try {
      const res = await fetch(`/api/audit-logs?employeeId=${employeeId}&action=TIME_RECORD`)
      const logs = await res.json()
      setPointHistoryLogs(logs)
    } catch (e) {
      setPointHistoryLogs([])
    } finally {
      setPointHistoryLoading(false)
    }
  }

  // Seleção múltipla
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([])
    } else {
      setSelectedRows(allEntryIds)
    }
  }
  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const clearSelection = () => setSelectedRows([])
  const handleBulkExport = async () => {
    if (selectedRows.length === 0) return
    const params = new URLSearchParams()
    selectedRows.forEach(id => params.append('ids', id))
    params.append('format', 'csv')
    const res = await fetch(`/api/workforce/export?${params.toString()}`)
    const blob = await res.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = 'efetivo_selecionado.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(downloadUrl)
    clearSelection()
  }
  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    try {
      const res = await fetch('/api/workforce/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRows })
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Erro ao excluir registros');
      } else {
        toast.success('Registros excluídos com sucesso!');
        clearSelection();
        refreshData();
        setShowBulkDeleteModal(false);
      }
    } catch (err) {
      toast.error('Erro ao excluir registros');
    } finally {
      setBulkDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com Informações de Permissão */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle do Efetivo</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Controle organizado por contrato</p>
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
          {stats && (
            <p className="text-sm text-gray-500 mt-1">
              Última atualização: {new Date(stats.lastUpdated).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportData('csv')}
            disabled={!stats}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportData('xlsx')}
            disabled={!stats}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowNFCReader(true)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={nfcStatus === 'processing'}
          >
            <Zap className={`h-4 w-4 mr-2 ${nfcStatus === 'processing' ? 'animate-pulse' : ''}`} />
            {nfcStatus === 'processing' ? 'Processando...' : 'Ler NFC'}
          </Button>
        </div>
      </div>

      {/* Stats por contrato ou globais */}
      {/* Exibe apenas UM dos blocos abaixo, nunca ambos */}
      {(!filters.contractId && !filters.location) ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { label: 'Total Funcionários', value: entries?.globalStats?.total ?? 0, color: 'blue', icon: Users },
            { label: 'Presentes', value:entries?.globalStats?.present ?? 0, color: 'green', icon: UserCheck },
            { label: 'Ausentes', value: entries?.globalStats?.absent ?? 0, color: 'red', icon: UserX },
            { label: 'Atrasados', value: entries?.globalStats?.late ?? 0, color: 'yellow', icon: AlertTriangle },
            { label: 'Saíram', value: entries?.globalStats?.left ?? 0, color: 'gray', icon: CheckCircle }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {entries?.globalStats?.total > 0 ? `${Math.round((stat.value / entries.globalStats.total) * 100)}%` : '0%'} do total
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
      ) : (!!filters.contractId || !!filters.location) ? (
        <div className="space-y-6">
          {(entries?.contractGroups && entries.contractGroups.length > 0 ? entries.contractGroups : [{ contractId: 'none', contractName: 'Sem Contrato', entries: [], stats: { total: 0, present: 0, absent: 0, late: 0, left: 0 } }]).map((c: any) => (
            <div key={c.contractId}>
              <div className="flex items-center gap-3 mb-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-bold text-blue-900">{c.contractName}</span>
                <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">{c.entries.length} funcionário(s)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[ 
                  { label: 'Total Funcionários', value: c.stats?.total ?? 0, color: 'blue', icon: Users },
                  { label: 'Presentes', value: c.stats?.present ?? 0, color: 'green', icon: UserCheck },
                  { label: 'Ausentes', value: c.stats?.absent ?? 0, color: 'red', icon: UserX },
                  { label: 'Atrasados', value: c.stats?.late ?? 0, color: 'yellow', icon: AlertTriangle },
                  { label: 'Saíram', value: c.stats?.left ?? 0, color: 'gray', icon: CheckCircle }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {c.stats?.total > 0 ? `${Math.round((stat.value / c.stats.total) * 100)}%` : '0%'} do total
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
            </div>
          ))}
        </div>
      ) : null}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <form className="flex flex-col gap-4 md:flex-row md:gap-4" aria-label="Filtros de efetivo">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <label htmlFor="search-term" className="text-xs text-gray-600">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                <input
                  id="search-term"
                  type="text"
                  placeholder="Buscar funcionário ou função..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-primary focus-visible:outline-primary"
                  aria-label="Buscar funcionário ou função"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-end md:items-center">
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label htmlFor="contract-select" className="text-xs text-gray-600">Contrato</label>
                <select
                  id="contract-select"
                  value={selectedContract}
                  onChange={(e) => setSelectedContract(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-primary focus-visible:outline-primary"
                  aria-label="Contrato"
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
              </div>
              {/* Filtro de horário (check-in) */}
              <div className="flex flex-col gap-1 min-w-[120px]">
                <label htmlFor="checkin-from" className="text-xs text-gray-600">Check-in de</label>
                <input
                  id="checkin-from"
                  type="time"
                  value={filterCheckInFrom}
                  onChange={e => setFilterCheckInFrom(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-primary focus-visible:outline-primary"
                  aria-label="Check-in de"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-[120px]">
                <label htmlFor="checkin-to" className="text-xs text-gray-600">até</label>
                <input
                  id="checkin-to"
                  type="time"
                  value={filterCheckInTo}
                  onChange={e => setFilterCheckInTo(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-primary focus-visible:outline-primary"
                  aria-label="Check-in até"
                />
              </div>
              {/* Filtro de horário (check-out) */}
              <div className="flex flex-col gap-1 min-w-[120px]">
                <label htmlFor="checkout-from" className="text-xs text-gray-600">Check-out de</label>
                <input
                  id="checkout-from"
                  type="time"
                  value={filterCheckOutFrom}
                  onChange={e => setFilterCheckOutFrom(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-primary focus-visible:outline-primary"
                  aria-label="Check-out de"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-[120px]">
                <label htmlFor="checkout-to" className="text-xs text-gray-600">até</label>
                <input
                  id="checkout-to"
                  type="time"
                  value={filterCheckOutTo}
                  onChange={e => setFilterCheckOutTo(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-primary focus-visible:outline-primary"
                  aria-label="Check-out até"
                />
              </div>
              {/* Botão Limpar Filtros e badge de filtros ativos */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="ml-2 flex items-center gap-1 border-red-300 text-red-700 hover:bg-red-50 focus:outline-primary focus-visible:outline-primary"
                  title="Limpar todos os filtros"
                  tabIndex={0}
                  aria-label="Limpar todos os filtros"
                >
                  Limpar Filtros
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {activeFiltersCount}
                  </span>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Barra de ações em lote */}
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-4 mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <span className="text-sm">{selectedRows.length} selecionado(s)</span>
          <Button size="sm" variant="outline" onClick={handleBulkExport}><Download className="h-4 w-4 mr-1" />Exportar Selecionados</Button>
          <Button size="sm" variant="danger" onClick={() => setShowBulkDeleteModal(true)} disabled={bulkDeleteLoading}><Trash2 className="h-4 w-4 mr-1" />Excluir Selecionados</Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>Limpar Seleção</Button>
        </div>
      )}

      {/* Modal de confirmação de exclusão em lote */}
      <Dialog open={showBulkDeleteModal} onOpenChange={setShowBulkDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <b>{selectedRows.length}</b> registro(s) de efetivo? Esta ação não pode ser desfeita e os registros serão removidos permanentemente do sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 my-4">
            <Trash2 className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Atenção!</h3>
              <p className="text-sm text-red-700 mt-1">
                Esta ação é irreversível. Todos os registros selecionados serão excluídos e não poderão ser recuperados.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6 px-6 pb-6">
            <Button variant="outline" onClick={() => setShowBulkDeleteModal(false)} disabled={bulkDeleteLoading}>Cancelar</Button>
            <Button variant="danger" onClick={handleBulkDelete} loading={bulkDeleteLoading}>
              <Trash2 className="h-4 w-4 mr-2" />Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabela de funcionários: modo global (todos os contratos acessíveis) */}
      {(!filters.contractId && !filters.location) ? (
        entries.entries && entries.entries.length > 0 ? (
          <div className="space-y-8">
            <Card className="shadow-md border border-gray-200">
              <CardHeader className="bg-blue-50 border-b border-blue-200 rounded-t-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <span className="text-lg font-bold text-blue-900">Todos os Funcionários</span>
                  <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">{entries.entries.length} funcionário(s)</span>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2"><input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} /></th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Nome</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Matrícula</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Função</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Check-in</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Check-out</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Horas</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Local</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">NFC</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Observações</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {entries.entries.map((entry: any) => (
                      <tr key={entry.id}>
                        <td className="px-2 py-2"><input type="checkbox" checked={selectedRows.includes(entry.id)} onChange={() => toggleSelectRow(entry.id)} /></td>
                        <td className="px-4 py-2">{entry.employeeName}</td>
                        <td className="px-4 py-2">{entry.employeeRegistration}</td>
                        <td className="px-4 py-2">{entry.functionName}</td>
                        <td className="px-4 py-2">{getStatusText(entry.status)}</td>
                        <td className="px-4 py-2">{formatTime(entry.checkInTime)}</td>
                        <td className="px-4 py-2">{formatTime(entry.checkOutTime)}</td>
                        <td className="px-4 py-2">{entry.hoursWorked ?? ''}</td>
                        <td className="px-4 py-2">{entry.location}</td>
                        <td className="px-4 py-2">{entry.nfcCardId}</td>
                        <td className="px-4 py-2">{entry.isLate ? 'Atrasado' : ''}</td>
                        <td className="px-4 py-2">
                          {/* Ações: histórico, editar, excluir, etc. */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum registro encontrado</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedContract !== 'all' 
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Nenhum registro de efetivo para o filtro atual.'}
                </p>
                <Button onClick={refreshData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="space-y-8">
          {contractGroups.map((group) => (
            <Card key={group.contractId} className="shadow-md border border-gray-200">
              <CardHeader className="bg-blue-50 border-b border-blue-200 rounded-t-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Building className="h-6 w-6 text-blue-600" />
                  <span className="text-lg font-bold text-blue-900">{group.contractName}</span>
                  <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">{group.entries.length} funcionário(s)</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-700">
                  <span><UserCheck className="inline h-4 w-4 text-green-600 mr-1" />Presentes: <b>{group.stats.present}</b></span>
                  <span><AlertTriangle className="inline h-4 w-4 text-yellow-600 mr-1" />Atrasados: <b>{group.stats.late}</b></span>
                  <span><UserX className="inline h-4 w-4 text-red-600 mr-1" />Ausentes: <b>{group.stats.absent}</b></span>
                  <span><CheckCircle className="inline h-4 w-4 text-gray-600 mr-1" />Saíram: <b>{group.stats.left}</b></span>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2"><input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} /></th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Nome</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Matrícula</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Função</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Check-in</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Check-out</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Horas</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Local</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">NFC</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Observações</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Ações</th>
                  </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {group.entries.map((entry) => (
                      <tr key={entry.id} className={`hover:bg-blue-50 transition-colors ${selectedRows.includes(entry.id) ? 'bg-blue-100' : ''}`}>
                        <td className="px-2 py-2"><input type="checkbox" checked={selectedRows.includes(entry.id)} onChange={() => toggleSelectRow(entry.id)} /></td>
                        <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">{entry.employeeName}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">{entry.employeeRegistration || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">{entry.functionName || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-semibold ${getStatusColor(entry.status)}`}>{getStatusIcon(entry.status)} {getStatusText(entry.status)}</span>
                      </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">{formatTime(entry.checkInTime) || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">{formatTime(entry.checkOutTime) || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">{entry.hoursWorked?.toFixed(1) || '0.0'}h</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">{entry.location || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">{entry.nfcCardId || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">-</td>
                        <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                          <Button size="sm" variant="ghost" title="Visualizar histórico" onClick={() => openAuditModal(entry.id)}><Clock className="h-4 w-4 text-gray-500" /></Button>
                          <Button size="sm" variant="ghost" title="Histórico de ponto do funcionário" onClick={() => openPointHistoryModal(entry.employeeId, entry.employeeName)}><History className="h-4 w-4 text-blue-500" /></Button>
                          <Button size="sm" variant="ghost" title="Editar"><Settings className="h-4 w-4 text-gray-500" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
        </CardContent>
      </Card>
          ))}
                </div>
              )}
              
      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Página <b>{page}</b> de <b>{totalPages}</b> | Total: <b>{total}</b> registros
                </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCurrentPage(1)} disabled={page === 1}>« Primeira</Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentPage(page - 1)} disabled={page === 1}>‹ Anterior</Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentPage(page + 1)} disabled={page === totalPages}>Próxima ›</Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentPage(totalPages)} disabled={page === totalPages}>Última »</Button>
          </div>
        </div>
      )}

      {/* NFC Reader Modal */}
      <NFCReadModal
        isOpen={showNFCReader}
        onClose={() => setShowNFCReader(false)}
        onBadgeDetected={handleNFCRead}
        title="Registro de Ponto"
        description="Aproxime o crachá NFC do leitor para registrar entrada/saída"
      />

      {/* Modal de Histórico de Auditoria */}
      <Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Histórico de Auditoria</DialogTitle>
            <DialogDescription>Veja todas as alterações deste registro de efetivo.</DialogDescription>
          </DialogHeader>
          {auditLoading ? (
            <div className="py-8 text-center text-gray-500">Carregando...</div>
          ) : auditLogs.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Nenhum log encontrado.</div>
          ) : (
            <ul className="space-y-4 max-h-96 overflow-auto">
              {auditLogs.map((log) => (
                <li key={log.id} className="border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">{log.action}</span>
                    <span className="text-xs text-gray-500">{log.user?.name || 'Sistema'}</span>
                  </div>
                  <pre className="text-xs bg-gray-50 rounded p-2 mt-1 overflow-x-auto">{JSON.stringify(log.details, null, 2)}</pre>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Histórico de Ponto do Funcionário */}
      <Dialog open={pointHistoryModalOpen} onOpenChange={setPointHistoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Histórico de Ponto do Funcionário</DialogTitle>
            <DialogDescription>
              {pointHistoryEmployee ? `Funcionário: ${pointHistoryEmployee.name}` : ''}
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            placeholder="Buscar por data, local, status..."
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded"
            value={pointHistorySearch}
            onChange={e => setPointHistorySearch(e.target.value)}
          />
          {pointHistoryLoading ? (
            <div className="py-8 text-center text-gray-500">Carregando...</div>
          ) : pointHistoryLogs.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Nenhum registro encontrado.</div>
          ) : (
            <ul className="space-y-4 max-h-96 overflow-auto">
              {pointHistoryLogs.filter(log => {
                const search = pointHistorySearch.toLowerCase()
                return (
                  log.details.status?.toLowerCase().includes(search) ||
                  (log.details.location || '').toLowerCase().includes(search) ||
                  (log.details.checkIn ? new Date(log.details.checkIn).toLocaleDateString('pt-BR') : '').includes(search) ||
                  (log.details.checkOut ? new Date(log.details.checkOut).toLocaleDateString('pt-BR') : '').includes(search)
                )
              }).map((log) => (
                <li key={log.id} className="border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">{log.details.status}</span>
                    <span className="text-xs text-gray-500">{log.details.location || '-'}</span>
                  </div>
                  <div className="text-xs text-gray-700 mt-1">
                    Entrada: {log.details.checkIn ? new Date(log.details.checkIn).toLocaleString('pt-BR') : '-'}<br />
                    Saída: {log.details.checkOut ? new Date(log.details.checkOut).toLocaleString('pt-BR') : '-'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}