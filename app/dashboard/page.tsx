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
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardStats } from '@/lib/mock-data'
export default function DashboardPage() {
  const stats = getDashboardStats()

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Contracts',
      value: stats.activeContracts,
      change: '+5%',
      changeType: 'positive',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Pending Transfers',
      value: stats.pendingTransfers,
      change: '-8%',
      changeType: 'negative',
      icon: ArrowLeftRight,
      color: 'orange'
    },
    {
      title: 'Compliance Rate',
      value: `${stats.complianceRate}%`,
      change: '+3%',
      changeType: 'positive',
      icon: Shield,
      color: 'purple'
    }
  ]

  const recentActivities = [
    {
      id: '1',
      type: 'transfer',
      message: 'John Mitchell transfer request submitted',
      time: '2 hours ago',
      icon: ArrowLeftRight,
      color: 'blue'
    },
    {
      id: '2',
      type: 'aso',
      message: 'Sarah Johnson ASO expires in 30 days',
      time: '4 hours ago',
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      id: '3',
      type: 'training',
      message: 'Safety training completed by 5 employees',
      time: '6 hours ago',
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: '4',
      type: 'contract',
      message: 'New contract added: IT Services',
      time: '1 day ago',
      icon: FileText,
      color: 'purple'
    }
  ]

  const alerts = [
    {
      id: '1',
      type: 'warning',
      title: 'ASOs Expiring Soon',
      message: `${stats.expiringASOs} employees have ASOs expiring within 30 days`,
      action: 'View Details'
    },
    {
      id: '2',
      type: 'error',
      title: 'Expired Trainings',
      message: `${stats.expiredTrainings} training certificates have expired`,
      action: 'Schedule Renewals'
    },
    {
      id: '3',
      type: 'info',
      title: 'Transfer Approvals',
      message: `${stats.pendingTransfers} transfer requests pending approval`,
      action: 'Review Requests'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao painel de controle</p>
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
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm flex items-center mt-2 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
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
                Recent Activity
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

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    alert.type === 'error' ? 'bg-red-50 border-red-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <h4 className="text-sm font-semibold mb-1">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-gray-700 mb-2">{alert.message}</p>
                    <button className="text-xs font-medium text-primary hover:underline">
                      {alert.action}
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