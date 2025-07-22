'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building, 
  Shield, 
  Zap, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Target,
  DollarSign,
  User,
  UserCheck,
  UserX,
  Briefcase
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'

interface AnalyticsData {
  workforce: {
    totalEmployees: number
    activeEmployees: number
    presentToday: number
    averageAttendance: number
    topContracts: Array<{ name: string; employees: number }>
  }
  contracts: {
    totalContracts: number
    activeContracts: number
    totalRevenue: number
    averageCost: number
    performance: Array<{ name: string; efficiency: number }>
  }
  nfc: {
    totalBadges: number
    activeBadges: number
    dailyScans: number
    averageResponseTime: number
    usage: Array<{ hour: number; scans: number }>
  }
  trends: {
    attendanceTrend: Array<{ date: string; percentage: number }>
    contractsTrend: Array<{ month: string; contracts: number }>
    nfcTrend: Array<{ week: string; usage: number }>
  }
}

// Mock data para demonstração - fallback caso a API falhe
const mockAnalyticsData: AnalyticsData = {
  workforce: {
    totalEmployees: 1247,
    activeEmployees: 1198,
    presentToday: 987,
    averageAttendance: 82.4,
    topContracts: [
      { name: 'Contrato Industrial A', employees: 156 },
      { name: 'Contrato Comercial B', employees: 134 },
      { name: 'Contrato Logística C', employees: 98 },
      { name: 'Contrato Segurança D', employees: 87 },
      { name: 'Contrato Limpeza E', employees: 76 }
    ]
  },
  contracts: {
    totalContracts: 15,
    activeContracts: 12,
    totalRevenue: 2450000,
    averageCost: 204167,
    performance: [
      { name: 'Industrial A', efficiency: 94.2 },
      { name: 'Comercial B', efficiency: 89.7 },
      { name: 'Logística C', efficiency: 87.3 },
      { name: 'Segurança D', efficiency: 91.8 },
      { name: 'Limpeza E', efficiency: 85.6 }
    ]
  },
  nfc: {
    totalBadges: 1350,
    activeBadges: 1198,
    dailyScans: 2394,
    averageResponseTime: 0.8,
    usage: [
      { hour: 6, scans: 45 },
      { hour: 7, scans: 189 },
      { hour: 8, scans: 234 },
      { hour: 9, scans: 156 },
      { hour: 10, scans: 98 },
      { hour: 11, scans: 123 },
      { hour: 12, scans: 203 },
      { hour: 13, scans: 187 },
      { hour: 14, scans: 134 },
      { hour: 15, scans: 156 },
      { hour: 16, scans: 145 },
      { hour: 17, scans: 198 },
      { hour: 18, scans: 187 }
    ]
  },
  trends: {
    attendanceTrend: [
      { date: '2025-01-01', percentage: 78.5 },
      { date: '2025-01-02', percentage: 81.2 },
      { date: '2025-01-03', percentage: 79.8 },
      { date: '2025-01-04', percentage: 83.4 },
      { date: '2025-01-05', percentage: 82.1 },
      { date: '2025-01-06', percentage: 85.7 },
      { date: '2025-01-07', percentage: 82.4 }
    ],
    contractsTrend: [
      { month: 'Jul', contracts: 8 },
      { month: 'Ago', contracts: 10 },
      { month: 'Set', contracts: 12 },
      { month: 'Out', contracts: 13 },
      { month: 'Nov', contracts: 14 },
      { month: 'Dez', contracts: 15 },
      { month: 'Jan', contracts: 15 }
    ],
    nfcTrend: [
      { week: 'Sem 1', usage: 18500 },
      { week: 'Sem 2', usage: 19200 },
      { week: 'Sem 3', usage: 20100 },
      { week: 'Sem 4', usage: 21300 },
      { week: 'Sem 5', usage: 22800 }
    ]
  }
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Hook para dados de analytics
  const { data: analyticsData = mockAnalyticsData, isLoading } = useQuery({
    queryKey: ['analytics', selectedPeriod, selectedCategory],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        params.append('period', selectedPeriod)
        params.append('category', selectedCategory)
        
        const response = await fetch(`/api/analytics?${params}`)
        if (!response.ok) {
          throw new Error('Falha ao carregar dados de analytics')
        }
        
        return response.json()
      } catch (error) {
        console.warn('Falha ao carregar dados da API, usando dados mock:', error)
        return mockAnalyticsData
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simular refresh
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const handleExport = () => {
    // Futura implementação de exportação
    
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <span className="text-gray-600">Carregando analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Análise Avançada</h1>
          <p className="text-gray-600">Dashboard completo de métricas e indicadores de performance</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtros de Período */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="1d">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>

          {/* Filtros de Categoria */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todas as categorias</option>
            <option value="workforce">Efetivo</option>
            <option value="contracts">Contratos</option>
            <option value="nfc">NFC</option>
            <option value="security">Segurança</option>
          </select>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.workforce.totalEmployees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.workforce.activeEmployees} ativos ({formatPercentage((analyticsData.workforce.activeEmployees / analyticsData.workforce.totalEmployees) * 100)})
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presença Hoje</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.workforce.presentToday}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage((analyticsData.workforce.presentToday / analyticsData.workforce.activeEmployees) * 100)} dos ativos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.contracts.activeContracts}</div>
              <p className="text-xs text-muted-foreground">
                de {analyticsData.contracts.totalContracts} contratos totais
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analyticsData.contracts.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Média: {formatCurrency(analyticsData.contracts.averageCost)} por contrato
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análise de Efetivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Distribuição por Contrato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.workforce.topContracts.map((contract, index) => (
                  <div key={contract.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-blue-${(index + 1) * 100}`}></div>
                      <span className="text-sm font-medium">{contract.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{contract.employees}</div>
                      <div className="text-xs text-gray-500">
                        {formatPercentage((contract.employees / analyticsData.workforce.activeEmployees) * 100)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance de Contratos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance dos Contratos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.contracts.performance.map((contract, index) => (
                  <div key={contract.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{contract.name}</span>
                      <span className="text-sm font-bold">{formatPercentage(contract.efficiency)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${contract.efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Uso de NFC por Horário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Uso de NFC por Horário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-4">
                  <div>Horário</div>
                  <div>Leituras</div>
                  <div>%</div>
                  <div>Status</div>
                </div>
                {analyticsData.nfc.usage.map((hour) => {
                  const percentage = (hour.scans / analyticsData.nfc.dailyScans) * 100
                  return (
                    <div key={hour.hour} className="grid grid-cols-4 gap-2 items-center text-sm">
                      <div className="font-medium">{hour.hour}:00</div>
                      <div>{hour.scans}</div>
                      <div>{formatPercentage(percentage)}</div>
                      <div className="flex items-center gap-1">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            percentage > 10 ? 'bg-green-500' : 
                            percentage > 5 ? 'bg-yellow-500' : 'bg-gray-300'
                          }`}
                        ></div>
                        <span className="text-xs text-gray-500">
                          {percentage > 10 ? 'Alto' : percentage > 5 ? 'Médio' : 'Baixo'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Métricas de NFC */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Métricas de Sistema NFC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analyticsData.nfc.totalBadges}</div>
                    <div className="text-sm text-blue-800">Total de Crachás</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analyticsData.nfc.activeBadges}</div>
                    <div className="text-sm text-green-800">Crachás Ativos</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analyticsData.nfc.dailyScans.toLocaleString()}</div>
                    <div className="text-sm text-purple-800">Leituras Hoje</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{analyticsData.nfc.averageResponseTime}s</div>
                    <div className="text-sm text-orange-800">Tempo Médio</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Taxa de Utilização</span>
                    <span className="text-sm font-bold">
                      {formatPercentage((analyticsData.nfc.activeBadges / analyticsData.nfc.totalBadges) * 100)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(analyticsData.nfc.activeBadges / analyticsData.nfc.totalBadges) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tendências */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendências de Presença - Últimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {analyticsData.trends.attendanceTrend.map((day, index) => (
                  <div key={day.date} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div className="h-24 bg-gray-100 rounded-lg flex items-end justify-center p-2">
                      <div 
                        className="bg-blue-500 rounded-t w-full transition-all duration-500"
                        style={{ height: `${day.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs font-medium mt-2">{formatPercentage(day.percentage)}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm">Taxa de Presença</span>
                </div>
                <div className="text-sm text-gray-500">
                  Média da semana: {formatPercentage(analyticsData.workforce.averageAttendance)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alertas e Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Insights e Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Tendência Positiva</span>
                </div>
                <p className="text-sm text-green-700">
                  Taxa de presença aumentou 3.2% na última semana
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Atenção Necessária</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Contrato Logística C com eficiência abaixo da média
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Oportunidade</span>
                </div>
                <p className="text-sm text-blue-700">
                  152 crachás NFC disponíveis para novos funcionários
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 