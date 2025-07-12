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
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import NFCReadModal from '@/components/nfc/NFCReadModal'
import { useWorkforceRealTime, useProcessNFC } from '@/lib/useWorkforce'
import { useContractsQuery } from '@/lib/useContracts'
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

export default function WorkforceControlPage() {
  // Inicialize diretamente, sem useState/useEffect
  const currentUser = getCurrentUser()
  const userPermissions = getUserPermissions(currentUser)

  const [selectedContract, setSelectedContract] = useState<string>('all')
  const [showNFCReader, setShowNFCReader] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [nfcStatus, setNfcStatus] = useState('idle')
  const [nfcReadValue, setNfcReadValue] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20 // ou outro valor desejado

  const { data: contractsData } = useContractsQuery()
  const contracts = contractsData?.contracts || []
  
  const filters: WorkforceFilters = {
    contractId: selectedContract === 'all' ? undefined : selectedContract,
    search: searchTerm || undefined,
    dateRange: {
      from: selectedDate,
      to: selectedDate
    }
  }

  // Corrigir página para nunca ser menor que 1
  const safePage = currentPage < 1 ? 1 : currentPage

  const { entries, stats, isLoading, error, refetch, page, totalPages, total, limit } = useWorkforceRealTime(filters, safePage, pageSize)
  const processNFCMutation = useProcessNFC()

  // Contratos acessíveis baseado nas permissões
  const accessibleContracts = currentUser ? getAccessibleContracts(currentUser, contracts) : []

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

  // [2] Só depois dos hooks, os returns condicionais:
  if (!currentUser || !userPermissions || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <span className="text-gray-600">Carregando controle de efetivo...</span>
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
          <p className="text-sm text-gray-500 mt-2">Tente recarregar a página</p>
          <Button onClick={refreshData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
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

  const exportData = () => {
    if (!stats) return
    
    const dataToExport = {
      data: selectedDate.toLocaleDateString('pt-BR'),
      estatisticas: {
        totalFuncionarios: stats.totalEmployees,
        presentes: stats.present,
        atrasados: stats.late,
        ausentes: stats.absent,
        sairam: stats.left,
        taxaPresenca: `${stats.presenceRate}%`,
        horaMediaEntrada: stats.averageCheckInTime
      },
      funcionarios: entries.map(entry => ({
        nome: entry.employeeName,
        contrato: entry.contractName,
        funcao: entry.functionName,
        entrada: formatTime(entry.checkInTime) || 'Não registrada',
        saida: formatTime(entry.checkOutTime) || 'Não registrada',
        status: entry.status,
        local: entry.location || 'Não informado',
        horasTrabalhadas: entry.hoursWorked?.toFixed(1) || '0.0',
        atrasado: entry.isLate ? 'Sim' : 'Não'
      }))
    }
    
    console.log('Dados para exportação:', dataToExport)
    // TODO: Implementar download do arquivo CSV/Excel
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800'
      case 'ABSENT': return 'bg-red-100 text-red-800'
      case 'LATE': return 'bg-yellow-100 text-yellow-800'
      case 'LEFT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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
            onClick={exportData}
            disabled={!stats}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
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

      {/* Global Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { label: 'Total Funcionários', value: stats.totalEmployees, color: 'blue', icon: Users },
            { label: 'Presentes', value: stats.present, color: 'green', icon: UserCheck },
            { label: 'Ausentes', value: stats.absent, color: 'red', icon: UserX },
            { label: 'Atrasados', value: stats.late, color: 'yellow', icon: AlertTriangle },
            { label: 'Saíram', value: stats.left, color: 'gray', icon: CheckCircle }
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
                        {stats.totalEmployees > 0 ? 
                          `${Math.round((stat.value / stats.totalEmployees) * 100)}%` : 
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
      )}

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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workforce Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Registros de Efetivo
            {stats && (
              <span className="text-sm font-normal text-gray-500">
                ({total} registros) - Página {page} de {totalPages} - Taxa de presença: {stats.presenceRate}%
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum registro de efetivo encontrado</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || selectedContract !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Os funcionários ainda não registraram ponto hoje'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Funcionário</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contrato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Função</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Entrada</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Saída</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Horas</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Local</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{entry.employeeName}</div>
                        {entry.nfcCardId && (
                          <div className="text-sm text-gray-500">NFC: {entry.nfcCardId}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.contractName || 'Não definido'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.functionName || 'Não definida'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {(() => {
                          const formattedTime = formatTime(entry.checkInTime)
                          return formattedTime ? (
                            <div>
                              <div>{formattedTime}</div>
                              {entry.isLate && (
                                <div className="text-xs text-red-600 font-medium">ATRASADO</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Não registrada</span>
                          )
                        })()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {(() => {
                          const formattedTime = formatTime(entry.checkOutTime)
                          return formattedTime ? formattedTime : (
                            <span className="text-gray-400">Não registrada</span>
                          )
                        })()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.hoursWorked ? `${entry.hoursWorked.toFixed(1)}h` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(entry.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                            {getStatusText(entry.status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.location || 'Não informado'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Paginação */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              Mostrando página {page} de {totalPages} ({total} registros)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-700">Página {page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={page >= totalPages || totalPages <= 1}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFC Reader Modal */}
      <NFCReadModal
        isOpen={showNFCReader}
        onClose={() => setShowNFCReader(false)}
        onBadgeDetected={handleNFCRead}
        title="Leitura NFC para Registro de Efetivo"
        description="Aproxime o crachá do dispositivo para registrar o ponto."
      />

      {/* Feedback visual após leitura NFC */}
      {(processNFCMutation.isSuccess || processNFCMutation.isError) && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`rounded-lg shadow-lg px-8 py-6 text-center bg-white border-2
              ${processNFCMutation.isSuccess ? 'border-green-400' : 'border-red-400'}`}
          >
            {processNFCMutation.isSuccess ? (
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            )}
            <div className="text-lg font-semibold mb-1">
              {getNFCFeedback(processNFCMutation)?.message}
            </div>
            {processNFCMutation.isSuccess && processNFCMutation.data?.isLate && (
              <div className="text-yellow-700 text-sm font-medium">Atenção: registro atrasado!</div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}