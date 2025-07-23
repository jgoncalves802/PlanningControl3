'use client'

import React from 'react'
import { useState, useEffect } from 'react'
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
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  FileText,
  BarChart3,
  Activity,
  Shield
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

// Interfaces
interface ProjectPhase {
  id: string
  name: string
  startDate: Date
  endDate: Date
  duration: number
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed'
  progress: number
}

interface ContractFunction {
  id: string
  name: string
  description: string
  unitPrice: number
  hoursPerDay: number
  totalHoursSold: number
  totalValue: number
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
  totalDailyHours: number
}

// Mock data
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
        totalValue: 360000,
        employeesRequired: 3,
        currentEmployees: 2,
        phases: [
          { phaseId: 'engineering', hoursAllocated: 1200, employeesNeeded: 2 },
          { phaseId: 'execution', hoursAllocated: 800, employeesNeeded: 2 }
        ]
      }
    ]
  }
]

export default function PlanningPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [contracts, setContracts] = useState<PlanningContract[]>([])
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'functions' | 'budget' | 'hour-distribution'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [hourControls, setHourControls] = useState<HourControl[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Inicializar usuário e permissões
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)
    
    const planningContracts = mockPlanningContracts.filter(contract => 
      canUserAccessContract(user, contract.id)
    )
    setContracts(planningContracts)

    // Gerar dados de controle de horas
    generateHourControlData(planningContracts)
  }, [])

  // Gerar dados de controle de horas
  const generateHourControlData = (contracts: PlanningContract[]) => {
    const hourData: HourControl[] = []
    
    contracts.forEach(contract => {
      contract.functions.forEach(func => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
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
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
            <Button size="sm">
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
          <div key={stat.label} className="transition-all duration-300 ease-in-out">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                    stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                    stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                    stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                    stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    <stat.icon className={`h-5 w-5 ${
                      stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                      stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </div>
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
                    { id: 'hour-distribution', label: 'Distribuição HH', icon: Clock }
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
                {/* Hour Distribution Tab */}
                {activeTab === 'hour-distribution' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100">Distribuição de Horas por Dia e Funções</h4>
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

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
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
                  </div>
                )}

                {/* Functions Tab */}
                {activeTab === 'functions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100">Funções Vendidas</h4>
                      {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                        <Button size="sm">
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
                        <div
                          key={phase.id}
                          className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 transition-all duration-300"
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
                        </div>
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
    </div>
  )
} 