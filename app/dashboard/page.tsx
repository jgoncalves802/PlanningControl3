'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  BarChart3,
  Calendar,
  MapPin,
  ArrowRightLeft
} from 'lucide-react'
import { useAppSettings } from '@/lib/contexts/AppSettingsContext'
import { cn } from '@/lib/utils'

// Mock data
const dashboardStats = {
  totalEmployees: 1247,
  activeContracts: 23,
  safetyCompliance: 98.5,
  pendingTransfers: 12,
  todayAssignments: 89,
  upcomingDeadlines: 7
}

const recentActivities = [
  {
    id: 1,
    type: 'transfer',
    message: 'João Silva transferido para Contrato A',
    time: '2 minutos atrás',
    status: 'completed'
  },
  {
    id: 2,
    type: 'safety',
    message: 'ASO de Maria Santos vence em 5 dias',
    time: '15 minutos atrás',
    status: 'warning'
  },
  {
    id: 3,
    type: 'contract',
    message: 'Novo contrato "Operação B" criado',
    time: '1 hora atrás',
    status: 'completed'
  },
  {
    id: 4,
    type: 'employee',
    message: '5 novos funcionários cadastrados',
    time: '2 horas atrás',
    status: 'completed'
  }
]

export default function DashboardPage() {
  const { settings } = useAppSettings()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de controle de planejamento
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {currentTime.toLocaleString('pt-BR')}
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={cn(
        "grid gap-6",
        settings.dashboardLayout === 'grid' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        settings.dashboardLayout === 'list' && "grid-cols-1",
        settings.dashboardLayout === 'compact' && "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
      )}>
        <Card className={cn(
          settings.compactMode && "p-3",
          settings.showAnimations && "animate-fade-in"
        )}>
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-2",
            settings.compactMode && "pb-1"
          )}>
            <CardTitle className={cn(
              "text-sm font-medium",
              settings.compactMode && "text-xs"
            )}>
              Total de Funcionários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              settings.compactMode && "text-lg"
            )}>
              {dashboardStats.totalEmployees.toLocaleString()}
            </div>
            <p className={cn(
              "text-xs text-muted-foreground",
              settings.compactMode && "text-xs"
            )}>
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          settings.compactMode && "p-3",
          settings.showAnimations && "animate-fade-in"
        )}>
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-2",
            settings.compactMode && "pb-1"
          )}>
            <CardTitle className={cn(
              "text-sm font-medium",
              settings.compactMode && "text-xs"
            )}>
              Contratos Ativos
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              settings.compactMode && "text-lg"
            )}>
              {dashboardStats.activeContracts}
            </div>
            <p className={cn(
              "text-xs text-muted-foreground",
              settings.compactMode && "text-xs"
            )}>
              3 contratos próximos do vencimento
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          settings.compactMode && "p-3",
          settings.showAnimations && "animate-fade-in"
        )}>
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-2",
            settings.compactMode && "pb-1"
          )}>
            <CardTitle className={cn(
              "text-sm font-medium",
              settings.compactMode && "text-xs"
            )}>
              Conformidade de Segurança
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              settings.compactMode && "text-lg"
            )}>
              {dashboardStats.safetyCompliance}%
            </div>
            <p className={cn(
              "text-xs text-muted-foreground",
              settings.compactMode && "text-xs"
            )}>
              +2.1% em relação à semana passada
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          settings.compactMode && "p-3",
          settings.showAnimations && "animate-fade-in"
        )}>
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-2",
            settings.compactMode && "pb-1"
          )}>
            <CardTitle className={cn(
              "text-sm font-medium",
              settings.compactMode && "text-xs"
            )}>
              Transferências Pendentes
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              settings.compactMode && "text-lg"
            )}>
              {dashboardStats.pendingTransfers}
            </div>
            <p className={cn(
              "text-xs text-muted-foreground",
              settings.compactMode && "text-xs"
            )}>
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          settings.compactMode && "p-3",
          settings.showAnimations && "animate-fade-in"
        )}>
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-2",
            settings.compactMode && "pb-1"
          )}>
            <CardTitle className={cn(
              "text-sm font-medium",
              settings.compactMode && "text-xs"
            )}>
              Atribuições Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              settings.compactMode && "text-lg"
            )}>
              {dashboardStats.todayAssignments}
            </div>
            <p className={cn(
              "text-xs text-muted-foreground",
              settings.compactMode && "text-xs"
            )}>
              95% concluídas
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          settings.compactMode && "p-3",
          settings.showAnimations && "animate-fade-in"
        )}>
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-2",
            settings.compactMode && "pb-1"
          )}>
            <CardTitle className={cn(
              "text-sm font-medium",
              settings.compactMode && "text-xs"
            )}>
              Prazos Próximos
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              settings.compactMode && "text-lg"
            )}>
              {dashboardStats.upcomingDeadlines}
            </div>
            <p className={cn(
              "text-xs text-muted-foreground",
              settings.compactMode && "text-xs"
            )}>
              Nos próximos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      {settings.showNotifications && (
        <Card className={cn(
          settings.showAnimations && "animate-slide-in"
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {settings.showQuickActions && (
        <Card className={cn(
          settings.showAnimations && "animate-slide-in"
        )}>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades mais usadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Adicionar Funcionário</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Building className="h-6 w-6 mb-2" />
                <span className="text-sm">Novo Contrato</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <ArrowRightLeft className="h-6 w-6 mb-2" />
                <span className="text-sm">Transferir Funcionário</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Shield className="h-6 w-6 mb-2" />
                <span className="text-sm">Verificar Segurança</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}