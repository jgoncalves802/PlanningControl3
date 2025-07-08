'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  FileText,
  Shield,
  ArrowLeftRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Building2,
  UserCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardStats } from '@/lib/useDashboard'

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats()

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600">Erro ao carregar estatísticas do dashboard</p>
          <p className="text-sm text-gray-500 mt-2">Tente recarregar a página</p>
        </div>
      </div>
    )
  }

  // No data fallback
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-600">Nenhuma estatística disponível</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Funcionários Ativos',
      value: stats.activeEmployees,
      total: stats.totalEmployees,
      change: stats.recentActivity.employees > 0 ? `+${stats.recentActivity.employees}` : '0',
      changeType: stats.recentActivity.employees > 0 ? 'positive' : 'neutral',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Contratos Ativos',
      value: stats.activeContracts,
      total: stats.totalContracts,
      change: stats.recentActivity.contracts > 0 ? `+${stats.recentActivity.contracts}` : '0',
      changeType: stats.recentActivity.contracts > 0 ? 'positive' : 'neutral',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Funções Ativas',
      value: stats.activeFunctions,
      total: stats.totalFunctions,
      change: stats.recentActivity.functions > 0 ? `+${stats.recentActivity.functions}` : '0',
      changeType: stats.recentActivity.functions > 0 ? 'positive' : 'neutral',
      icon: Building2,
      color: 'purple'
    },
    {
      title: 'Taxa de Compliance',
      value: `${stats.complianceRate}%`,
      subtitle: `${stats.employeesWithFunctions}/${stats.activeEmployees} com funções`,
      change: stats.complianceRate >= 90 ? 'Excelente' : stats.complianceRate >= 70 ? 'Bom' : 'Precisa melhorar',
      changeType: stats.complianceRate >= 90 ? 'positive' : stats.complianceRate >= 70 ? 'neutral' : 'negative',
      icon: UserCheck,
      color: 'orange'
    }
  ]

  const recentActivities = [
    {
      id: '1',
      type: 'employee',
      message: `${stats.recentActivity.employees} novos funcionários adicionados`,
      time: 'Últimos 30 dias',
      icon: Users,
      color: 'blue'
    },
    {
      id: '2',
      type: 'contract',
      message: `${stats.recentActivity.contracts} novos contratos criados`,
      time: 'Últimos 30 dias',
      icon: FileText,
      color: 'green'
    },
    {
      id: '3',
      type: 'function',
      message: `${stats.recentActivity.functions} novas funções definidas`,
      time: 'Últimos 30 dias',
      icon: Building2,
      color: 'purple'
    },
    {
      id: '4',
      type: 'assignment',
      message: `${stats.functionsWithEmployees} funções com funcionários atribuídos`,
      time: 'Atualmente',
      icon: CheckCircle,
      color: 'orange'
    }
  ]

  const insights = [
    {
      id: '1',
      type: 'info',
      title: 'Distribuição de Mão de Obra',
      message: `${stats.directLaborEmployees} funcionários diretos e ${stats.indirectLaborEmployees} indiretos`,
      action: 'Ver Detalhes'
    },
    {
      id: '2',
      type: stats.averageEmployeesPerContract < 10 ? 'warning' : 'info',
      title: 'Média por Contrato',
      message: `${stats.averageEmployeesPerContract} funcionários por contrato em média`,
      action: 'Analisar Distribuição'
    },
    {
      id: '3',
      type: stats.complianceRate < 70 ? 'error' : stats.complianceRate < 90 ? 'warning' : 'success',
      title: 'Compliance de Funções',
      message: `${stats.complianceRate}% dos funcionários têm funções atribuídas`,
      action: stats.complianceRate < 90 ? 'Melhorar Atribuições' : 'Manter Padrão'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao painel de controle</p>
        <p className="text-xs text-gray-500 mt-1">
          Última atualização: {new Date(stats.lastUpdated).toLocaleString('pt-BR')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      {stat.total && (
                        <p className="text-sm text-gray-500">de {stat.total}</p>
                      )}
                    </div>
                    {stat.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                    )}
                    <p className={`text-sm flex items-center mt-2 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.change} nos últimos 30 dias
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 flex-shrink-0`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                      <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    insight.type === 'error' ? 'bg-red-50 border-red-400' :
                    insight.type === 'success' ? 'bg-green-50 border-green-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <h4 className="text-sm font-semibold mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-gray-700 mb-2">{insight.message}</p>
                    <button className="text-xs font-medium text-primary hover:underline">
                      {insight.action}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}