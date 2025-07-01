'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Search, 
  Plus, 
  MoreHorizontal,
  Eye,
  Edit,
  DollarSign,
  Clock,
  Users,
  Building,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  FileText,
  BarChart3,
  Zap,
  Timer,
  Activity,
  Shield,
  Filter,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import { 
  getCurrentUser, 
  getUserPermissions, 
  getAccessibleContracts, 
  canUserAccessContract,
  validateUserAccess,
  User,
  UserRole
} from '@/lib/auth'
import { mockContracts } from '@/lib/mock-data'

// Interfaces para o planejamento
interface ProjectPhase {
  id: string
  name: string
  startDate: Date
  endDate: Date
  duration: number // em dias
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed'
  progress: number // 0-100
  dependencies?: string[]
}

interface ContractFunction {
  id: string
  name: string
  description: string
  unitPrice: number
  hoursPerDay: number
  totalHoursSold: number
  totalValue: number // Valor total da função (unitPrice * totalHoursSold)
  employeesRequired: number
  currentEmployees: number
  phases: {
    phaseId: string
    hoursAllocated: number
    employeesNeeded: number
  }[]
}

interface PlanningContract {
  id: string
  name: string
  code: string
  client: string
  startDate: Date
  endDate: Date
  totalValue: number
  status: 'planning' | 'active' | 'completed' | 'on_hold'
  phases: ProjectPhase[]
  functions: ContractFunction[]
  progress: number
}

// Interfaces para controle de horas
interface HourControl {
  id: string
  contractId: string
  functionId: string
  functionName: string
  date: Date
  plannedHours: number
  actualHours: number
  projectedHours: number
  quantity: number
  hoursPerDay: number
  totalDailyHours: number // quantity * hoursPerDay
}

interface TimelineFunction {
  id: string
  contractId: string
  contractName: string
  functionName: string
  startDate: Date
  endDate: Date
  color: string
  employeeCount: number
}

// Fases padrão do projeto
const PROJECT_PHASES = [
  { id: 'mobilization', name: 'Mobilização', color: 'blue' },
  { id: 'manufacturing', name: 'Fabricação', color: 'purple' },
  { id: 'engineering', name: 'Engenharia', color: 'green' },
  { id: 'execution', name: 'Execução', color: 'orange' },
  { id: 'commissioning', name: 'Comissionamento e Teste', color: 'yellow' },
  { id: 'demobilization', name: 'Desmobilização', color: 'gray' }
]

export default function PlanningPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [accessibleContracts, setAccessibleContracts] = useState<any[]>([])
  const [contracts, setContracts] = useState<PlanningContract[]>([])
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'functions' | 'budget' | 'hour-control' | 'timeline'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewContractModal, setShowNewContractModal] = useState(false)
  const [showNewFunctionModal, setShowNewFunctionModal] = useState(false)
  const [hourControls, setHourControls] = useState<HourControl[]>([])
  const [timelineFunctions, setTimelineFunctions] = useState<TimelineFunction[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Inicializar usuário e permissões
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)
    
    const contracts = getAccessibleContracts(user, mockContracts)
    setAccessibleContracts(contracts)
    
    // Filtrar contratos de planejamento baseado nas permissões
    const planningContracts = mockPlanningContracts.filter(contract => 
      canUserAccessContract(user, contract.id)
    )
    setContracts(planningContracts)

    // Gerar dados de controle de horas
    generateHourControlData(planningContracts)
    
    // Gerar dados de timeline
    generateTimelineData(planningContracts)
  }, [])

  // Verificar se usuário pode acessar planejamento
  useEffect(() => {
    if (currentUser && !validateUserAccess(currentUser, 'VIEW_ANALYTICS')) {
      console.warn('Usuário sem permissão para acessar planejamento')
    }
  }, [currentUser])

  const generateHourControlData = (contracts: PlanningContract[]) => {
    const hourData: HourControl[] = []
    
    contracts.forEach(contract => {
      contract.functions.forEach(func => {
        // Gerar dados para os próximos 30 dias
        for (let i = 0; i < 30; i++) {
          const date = new Date()
          date.setDate(date.getDate() + i)
          
          const plannedHours = func.hoursPerDay * func.employeesRequired
          const actualHours = i < 5 ? plannedHours * (0.8 + Math.random() * 0.4) : 0
          const projectedHours = plannedHours * (0.9 + Math.random() * 0.2)
          
          hourData.push({
            id: `${contract.id}-${func.id}-${i}`,
            contractId: contract.id,
            functionId: func.id,
            functionName: func.name,
            date,
            plannedHours,
            actualHours,
            projectedHours,
            quantity: func.employeesRequired,
            hoursPerDay: func.hoursPerDay,
            totalDailyHours: func.employeesRequired * func.hoursPerDay
          })
        }
      })
    })
    
    setHourControls(hourData)
  }

  const generateTimelineData = (contracts: PlanningContract[]) => {
    const timelineData: TimelineFunction[] = []
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink', 'indigo']
    
    contracts.forEach((contract, contractIndex) => {
      contract.functions.forEach((func, funcIndex) => {
        timelineData.push({
          id: `${contract.id}-${func.id}`,
          contractId: contract.id,
          contractName: contract.name,
          functionName: func.name,
          startDate: contract.startDate,
          endDate: contract.endDate,
          color: colors[(contractIndex + funcIndex) % colors.length],
          employeeCount: func.employeesRequired
        })
      })
    })
    
    setTimelineFunctions(timelineData)
  }

  const filteredContracts = contracts.filter(contract => 
    contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.client.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedContractData = contracts.find(c => c.id === selectedContract)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'not_started': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'delayed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'in_progress': return <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'delayed': return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default: return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
    // Implementar lógica de adicionar treinamento
  }

  const handleRemoveTrainingFromContract = (contractTrainingId: string) => {
    // Implementar lógica de remover treinamento
  }

  const handleUpdateASOExpirationDays = (contractId: string, days: number) => {
    console.log(`Atualizando prazo ASO do contrato ${contractId} para ${days} dias`)
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

  // Verificar se usuário tem permissão para acessar planejamento
  if (!validateUserAccess(currentUser, 'VIEW_ANALYTICS')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-4">Você não tem permissão para acessar o módulo de planejamento.</p>
          <p className="text-sm text-gray-500 dark:text-slate-500">
            Função atual: <span className="font-medium">{getRoleDisplayName(currentUser.role)}</span>
          </p>
        </div>
      </div>
    )
  }

  const planningStats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    totalValue: contracts.reduce((sum, c) => sum + c.totalValue, 0),
    avgProgress: contracts.length > 0 ? Math.round(contracts.reduce((sum, c) => sum + c.progress, 0) / contracts.length) : 0,
    totalFunctions: contracts.reduce((sum, c) => sum + c.functions.length, 0),
    totalHours: contracts.reduce((sum, c) => 
      sum + c.functions.reduce((funcSum, f) => funcSum + f.totalHoursSold, 0), 0
    )
  }

  // Filtrar controles de hora para o contrato selecionado
  const selectedContractHourControls = selectedContractData 
    ? hourControls.filter(hc => hc.contractId === selectedContractData.id)
    : []

  // Agrupar por data para exibição
  const hourControlsByDate = selectedContractHourControls.reduce((acc, hc) => {
    const dateKey = hc.date.toISOString().split('T')[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(hc)
    return acc
  }, {} as Record<string, HourControl[]>)

  // Gerar dados para o gráfico de timeline
  const generateTimelineChart = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const currentYear = new Date().getFullYear()
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Timeline de Funções por Contrato</h4>
          <div className="text-sm text-gray-500 dark:text-slate-400">Ano: {currentYear}</div>
        </div>
        
        {/* Header com meses */}
        <div className="grid grid-cols-13 gap-1 mb-4">
          <div className="text-xs font-medium text-gray-600 dark:text-slate-400 p-2">Contrato/Função</div>
          {months.map((month, index) => (
            <div key={index} className="text-xs font-medium text-gray-600 dark:text-slate-400 text-center p-2">
              {month}
            </div>
          ))}
        </div>
        
        {/* Timeline bars */}
        <div className="space-y-2">
          {timelineFunctions.map((item, index) => {
            const startMonth = item.startDate.getMonth()
            const endMonth = item.endDate.getMonth()
            const duration = endMonth - startMonth + 1
            
            return (
              <div key={item.id} className="grid grid-cols-13 gap-1 items-center">
                <div className="text-sm font-medium text-gray-900 dark:text-slate-100 p-2 truncate">
                  <div className="font-semibold">{item.contractName}</div>
                  <div className="text-xs text-gray-600 dark:text-slate-400">{item.functionName}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-500">{item.employeeCount} funcionários</div>
                </div>
                
                {months.map((_, monthIndex) => (
                  <div key={monthIndex} className="h-12 relative">
                    {monthIndex >= startMonth && monthIndex <= endMonth && (
                      <div 
                        className={`h-8 rounded-md bg-${item.color}-500 dark:bg-${item.color}-600 flex items-center justify-center text-white text-xs font-medium shadow-sm`}
                        style={{
                          marginLeft: monthIndex === startMonth ? '0%' : '0',
                          marginRight: monthIndex === endMonth ? '0%' : '0'
                        }}
                      >
                        {monthIndex === startMonth && duration === 1 && (
                          <span className="truncate px-1">{item.functionName}</span>
                        )}
                        {monthIndex === startMonth && duration > 1 && (
                          <span className="truncate px-1">{item.functionName}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
        
        {/* Legenda */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-3">Legenda de Cores por Contrato</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Array.from(new Set(timelineFunctions.map(tf => tf.contractName))).map((contractName, index) => {
              const colors = ['blue', 'green', 'purple', 'orange', 'red', 'yellow']
              const color = colors[index % colors.length]
              return (
                <div key={contractName} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded bg-${color}-500 dark:bg-${color}-600`}></div>
                  <span className="text-sm text-gray-700 dark:text-slate-300">{contractName}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com Informações de Permissão */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Planejamento</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600 dark:text-slate-400">Gestão completa de contratos, funções e fases do projeto</p>
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
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
            <Button size="sm" onClick={() => setShowNewContractModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Contrato
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {[
          { label: 'Total Contratos', value: planningStats.totalContracts, color: 'blue', icon: Building },
          { label: 'Contratos Ativos', value: planningStats.activeContracts, color: 'green', icon: Activity },
          { label: 'Valor Total', value: formatCurrency(planningStats.totalValue), color: 'purple', icon: DollarSign },
          { label: 'Progresso Médio', value: `${planningStats.avgProgress}%`, color: 'orange', icon: TrendingUp },
          { label: 'Total Funções', value: planningStats.totalFunctions, color: 'yellow', icon: Users },
          { label: 'Horas Vendidas', value: planningStats.totalHours.toLocaleString(), color: 'red', icon: Clock }
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
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{stat.label}</p>
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
              <select className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">
                <option value="all">Todos os Status</option>
                <option value="planning">Planejamento</option>
                <option value="active">Ativo</option>
                <option value="completed">Concluído</option>
                <option value="on_hold">Em Espera</option>
              </select>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contracts List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Contratos ({filteredContracts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredContracts.map((contract) => (
                  <div
                    key={contract.id}
                    onClick={() => setSelectedContract(contract.id)}
                    className={`p-4 border-b border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                      selectedContract === contract.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-slate-100">{contract.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{contract.code}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{contract.client}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-slate-400">{formatCurrency(contract.totalValue)}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${contract.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-slate-400">{contract.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Details */}
        <div className="lg:col-span-2">
          {selectedContractData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedContractData.name}</CardTitle>
                    <p className="text-gray-500 dark:text-slate-400">{selectedContractData.client}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedContractData.status)}`}>
                      {selectedContractData.status.replace('_', ' ')}
                    </span>
                    {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1 mt-4">
                  {[
                    { id: 'overview', label: 'Visão Geral', icon: Eye },
                    { id: 'phases', label: 'Fases', icon: Calendar },
                    { id: 'functions', label: 'Funções', icon: Users },
                    { id: 'budget', label: 'Orçamento', icon: DollarSign },
                    { id: 'hour-control', label: 'Controle de Horas', icon: Clock },
                    { id: 'timeline', label: 'Timeline', icon: Activity }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                          : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Hour Control Tab */}
                {activeTab === 'hour-control' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100">Controle de Horas Efetivo e Equipamentos</h4>
                      <div className="flex items-center gap-3">
                        <input
                          type="date"
                          value={selectedDate.toISOString().split('T')[0]}
                          onChange={(e) => setSelectedDate(new Date(e.target.value))}
                          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                        />
                        {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Registro
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 dark:border-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-700">Função</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-700">Quantidade</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-700">Horas/Dia</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-700">Total HH/Dia</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-700">HH Previsto</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-700">HH Real</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-700">HH Projetado</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(hourControlsByDate).slice(0, 10).map(([date, controls]) => (
                            <React.Fragment key={date}>
                              <tr className="bg-blue-50 dark:bg-blue-900/20">
                                <td colSpan={8} className="p-3 font-medium text-blue-900 dark:text-blue-300 border-b border-gray-200 dark:border-slate-700">
                                  {formatDate(new Date(date))}
                                </td>
                              </tr>
                              {controls.map((control) => (
                                <tr key={control.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                                  <td className="p-3 text-sm text-gray-900 dark:text-slate-100 border-r border-gray-200 dark:border-slate-700">
                                    {control.functionName}
                                  </td>
                                  <td className="p-3 text-sm text-gray-900 dark:text-slate-100 border-r border-gray-200 dark:border-slate-700">
                                    {control.quantity}
                                  </td>
                                  <td className="p-3 text-sm text-gray-900 dark:text-slate-100 border-r border-gray-200 dark:border-slate-700">
                                    {control.hoursPerDay}h
                                  </td>
                                  <td className="p-3 text-sm font-medium text-blue-600 dark:text-blue-400 border-r border-gray-200 dark:border-slate-700">
                                    {control.totalDailyHours}h
                                  </td>
                                  <td className="p-3 text-sm text-gray-900 dark:text-slate-100 border-r border-gray-200 dark:border-slate-700">
                                    {control.plannedHours.toFixed(1)}h
                                  </td>
                                  <td className="p-3 text-sm text-green-600 dark:text-green-400 border-r border-gray-200 dark:border-slate-700">
                                    {control.actualHours.toFixed(1)}h
                                  </td>
                                  <td className="p-3 text-sm text-orange-600 dark:text-orange-400 border-r border-gray-200 dark:border-slate-700">
                                    {control.projectedHours.toFixed(1)}h
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center space-x-2">
                                      <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                                        <Button variant="ghost" size="sm">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Resumo diário */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Total HH Previsto</h5>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                          {selectedContractHourControls
                            .filter(hc => hc.date.toDateString() === selectedDate.toDateString())
                            .reduce((sum, hc) => sum + hc.plannedHours, 0)
                            .toFixed(1)}h
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h5 className="font-medium text-green-900 dark:text-green-300 mb-2">Total HH Real</h5>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                          {selectedContractHourControls
                            .filter(hc => hc.date.toDateString() === selectedDate.toDateString())
                            .reduce((sum, hc) => sum + hc.actualHours, 0)
                            .toFixed(1)}h
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <h5 className="font-medium text-orange-900 dark:text-orange-300 mb-2">Total HH Projetado</h5>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                          {selectedContractHourControls
                            .filter(hc => hc.date.toDateString() === selectedDate.toDateString())
                            .reduce((sum, hc) => sum + hc.projectedHours, 0)
                            .toFixed(1)}h
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    {generateTimelineChart()}
                  </div>
                )}

                {/* Functions Tab */}
                {activeTab === 'functions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100">Funções Vendidas</h4>
                      {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                        <Button size="sm" onClick={() => setShowNewFunctionModal(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Função
                        </Button>
                      )}
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300">Função</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300">Valor Unitário</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300">Horas/Dia</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300">Total Horas</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300">Valor Total</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300">Funcionários</th>
                            <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-slate-300">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                          {selectedContractData.functions.map((func) => (
                            <tr key={func.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                              <td className="p-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{func.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">{func.description}</p>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  {formatCurrency(func.unitPrice)}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                                  <span className="text-sm text-gray-900 dark:text-slate-100">{func.hoursPerDay}h</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                  {func.totalHoursSold.toLocaleString()}h
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="text-sm font-bold text-primary">
                                  {formatCurrency(func.totalValue)}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                                  <span className="text-sm text-gray-900 dark:text-slate-100">
                                    {func.currentEmployees}/{func.employeesRequired}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Budget Tab */}
                {activeTab === 'budget' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                          {formatCurrency(selectedContractData.totalValue)}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400">Valor Total</p>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                          {selectedContractData.functions.reduce((sum, f) => sum + f.totalHoursSold, 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">Total Horas</p>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                          {selectedContractData.functions.reduce((sum, f) => sum + f.employeesRequired, 0)}
                        </p>
                        <p className="text-sm text-purple-700 dark:text-purple-400">Funcionários</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-4">Distribuição por Função</h4>
                      <div className="space-y-3">
                        {selectedContractData.functions.map((func) => {
                          const percentage = (func.totalValue / selectedContractData.totalValue) * 100
                          
                          return (
                            <div key={func.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{func.name}</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                    {formatCurrency(func.totalValue)}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-1">
                                  <span>{func.totalHoursSold.toLocaleString()}h vendidas</span>
                                  <span>{percentage.toFixed(1)}% do total</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Contract Info */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Informações do Contrato</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-400">Código:</span>
                            <span className="font-medium text-gray-900 dark:text-slate-100">{selectedContractData.code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-400">Início:</span>
                            <span className="font-medium text-gray-900 dark:text-slate-100">{formatDate(selectedContractData.startDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-400">Fim:</span>
                            <span className="font-medium text-gray-900 dark:text-slate-100">{formatDate(selectedContractData.endDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-400">Valor Total:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(selectedContractData.totalValue)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Progresso Geral</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-slate-400">Progresso do Projeto</span>
                              <span className="text-gray-900 dark:text-slate-100">{selectedContractData.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                              <div 
                                className="bg-primary h-3 rounded-full transition-all duration-300" 
                                style={{ width: `${selectedContractData.progress}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{selectedContractData.phases.length}</p>
                              <p className="text-blue-700 dark:text-blue-400">Fases</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-2xl font-bold text-green-900 dark:text-green-300">{selectedContractData.functions.length}</p>
                              <p className="text-green-700 dark:text-green-400">Funções</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Phase Overview */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Fases do Projeto</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedContractData.phases.map((phase) => (
                          <div key={phase.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getPhaseIcon(phase.status)}
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{phase.name}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{phase.duration} dias</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{phase.progress}%</p>
                              <div className="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-primary h-1 rounded-full" 
                                  style={{ width: `${phase.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Phases Tab */}
                {activeTab === 'phases' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100">Fases do Projeto</h4>
                      {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Fase
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {selectedContractData.phases.map((phase, index) => (
                        <motion.div
                          key={phase.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 dark:border-slate-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getPhaseIcon(phase.status)}
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-slate-100">{phase.name}</h5>
                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                  {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(phase.status)}`}>
                                {phase.status.replace('_', ' ')}
                              </span>
                              {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="text-center p-2 bg-gray-50 dark:bg-slate-800 rounded">
                              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{phase.duration}</p>
                              <p className="text-xs text-gray-600 dark:text-slate-400">Dias</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 dark:bg-slate-800 rounded">
                              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{phase.progress}%</p>
                              <p className="text-xs text-gray-600 dark:text-slate-400">Progresso</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 dark:bg-slate-800 rounded">
                              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                                {selectedContractData.functions.reduce((sum, f) => 
                                  sum + (f.phases.find(p => p.phaseId === phase.id)?.employeesNeeded || 0), 0
                                )}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-slate-400">Funcionários</p>
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${phase.progress}%` }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">Selecione um Contrato</h3>
                <p className="text-gray-600 dark:text-slate-400">Escolha um contrato da lista para ver os detalhes do planejamento</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Function Modal */}
      {showNewFunctionModal && validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Nova Função</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowNewFunctionModal(false)}
              >
                ×
              </Button>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nome da Função
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="Ex: Engenheiro Civil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Valor Unitário (R$/hora)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Horas por Dia
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Total de Horas Vendidas
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Funcionários Necessários
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Valor Total
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                    placeholder="Calculado automaticamente"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  placeholder="Descreva as responsabilidades da função..."
                />
              </div>

              {/* Phase Allocation */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-4">Alocação por Fase</h4>
                <div className="space-y-4">
                  {PROJECT_PHASES.map((phase) => (
                    <div key={phase.id} className="grid grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-${phase.color}-500`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{phase.name}</span>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Horas Alocadas</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Funcionários</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewFunctionModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button className="flex-1">
                  Criar Função
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Mock data para demonstração
const mockPlanningContracts: PlanningContract[] = [
  {
    id: '1',
    name: 'Projeto Industrial Alpha',
    code: 'IND-001',
    client: 'Petrobras S.A.',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-30'),
    totalValue: 15000000,
    status: 'active',
    progress: 35,
    phases: [
      {
        id: 'mobilization',
        name: 'Mobilização',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        duration: 31,
        status: 'completed',
        progress: 100
      },
      {
        id: 'engineering',
        name: 'Engenharia',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-05-30'),
        duration: 120,
        status: 'in_progress',
        progress: 75
      },
      {
        id: 'manufacturing',
        name: 'Fabricação',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-08-30'),
        duration: 150,
        status: 'in_progress',
        progress: 45
      },
      {
        id: 'execution',
        name: 'Execução',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-11-30'),
        duration: 150,
        status: 'not_started',
        progress: 0
      },
      {
        id: 'commissioning',
        name: 'Comissionamento e Teste',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-15'),
        duration: 45,
        status: 'not_started',
        progress: 0
      },
      {
        id: 'demobilization',
        name: 'Desmobilização',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-30'),
        duration: 15,
        status: 'not_started',
        progress: 0
      }
    ],
    functions: [
      {
        id: '1',
        name: 'Engenheiro Civil Sênior',
        description: 'Responsável pelo projeto estrutural e supervisão técnica',
        unitPrice: 150,
        hoursPerDay: 8,
        totalHoursSold: 2400,
        totalValue: 360000, // 150 * 2400
        employeesRequired: 3,
        currentEmployees: 2,
        phases: [
          { phaseId: 'engineering', hoursAllocated: 1200, employeesNeeded: 2 },
          { phaseId: 'execution', hoursAllocated: 800, employeesNeeded: 2 },
          { phaseId: 'commissioning', hoursAllocated: 400, employeesNeeded: 1 }
        ]
      },
      {
        id: '2',
        name: 'Soldador Qualificado',
        description: 'Soldagem de estruturas metálicas e tubulações',
        unitPrice: 85,
        hoursPerDay: 8,
        totalHoursSold: 4800,
        totalValue: 408000, // 85 * 4800
        employeesRequired: 8,
        currentEmployees: 6,
        phases: [
          { phaseId: 'manufacturing', hoursAllocated: 3200, employeesNeeded: 6 },
          { phaseId: 'execution', hoursAllocated: 1600, employeesNeeded: 4 }
        ]
      },
      {
        id: '3',
        name: 'Técnico em Segurança',
        description: 'Supervisão de segurança do trabalho e meio ambiente',
        unitPrice: 95,
        hoursPerDay: 8,
        totalHoursSold: 3200,
        totalValue: 304000, // 95 * 3200
        employeesRequired: 4,
        currentEmployees: 3,
        phases: [
          { phaseId: 'mobilization', hoursAllocated: 200, employeesNeeded: 1 },
          { phaseId: 'manufacturing', hoursAllocated: 1200, employeesNeeded: 2 },
          { phaseId: 'execution', hoursAllocated: 1600, employeesNeeded: 3 },
          { phaseId: 'commissioning', hoursAllocated: 200, employeesNeeded: 1 }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Modernização Refinaria Beta',
    code: 'REF-002',
    client: 'Vale S.A.',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-02-28'),
    totalValue: 25000000,
    status: 'planning',
    progress: 15,
    phases: [
      {
        id: 'mobilization',
        name: 'Mobilização',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        duration: 30,
        status: 'in_progress',
        progress: 60
      },
      {
        id: 'engineering',
        name: 'Engenharia',
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-07-31'),
        duration: 140,
        status: 'not_started',
        progress: 0
      },
      {
        id: 'manufacturing',
        name: 'Fabricação',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-11-30'),
        duration: 180,
        status: 'not_started',
        progress: 0
      },
      {
        id: 'execution',
        name: 'Execução',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-31'),
        duration: 150,
        status: 'not_started',
        progress: 0
      },
      {
        id: 'commissioning',
        name: 'Comissionamento e Teste',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-02-15'),
        duration: 45,
        status: 'not_started',
        progress: 0
      },
      {
        id: 'demobilization',
        name: 'Desmobilização',
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-02-28'),
        duration: 13,
        status: 'not_started',
        progress: 0
      }
    ],
    functions: [
      {
        id: '4',
        name: 'Gerente de Projeto',
        description: 'Gestão geral do projeto e interface com cliente',
        unitPrice: 200,
        hoursPerDay: 8,
        totalHoursSold: 3600,
        totalValue: 720000, // 200 * 3600
        employeesRequired: 1,
        currentEmployees: 0,
        phases: [
          { phaseId: 'mobilization', hoursAllocated: 240, employeesNeeded: 1 },
          { phaseId: 'engineering', hoursAllocated: 1120, employeesNeeded: 1 },
          { phaseId: 'manufacturing', hoursAllocated: 1440, employeesNeeded: 1 },
          { phaseId: 'execution', hoursAllocated: 800, employeesNeeded: 1 }
        ]
      },
      {
        id: '5',
        name: 'Instrumentista',
        description: 'Instalação e calibração de instrumentos de processo',
        unitPrice: 120,
        hoursPerDay: 8,
        totalHoursSold: 2880,
        totalValue: 345600, // 120 * 2880
        employeesRequired: 6,
        currentEmployees: 0,
        phases: [
          { phaseId: 'manufacturing', hoursAllocated: 960, employeesNeeded: 2 },
          { phaseId: 'execution', hoursAllocated: 1440, employeesNeeded: 4 },
          { phaseId: 'commissioning', hoursAllocated: 480, employeesNeeded: 3 }
        ]
      }
    ]
  }
]