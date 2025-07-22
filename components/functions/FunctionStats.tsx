'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Activity,
  CheckCircle,
  XCircle,
  Building,
  UserCheck
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useFunctionStats } from '@/lib/useFunctions'

export default function FunctionStats() {
  const stats = useFunctionStats()

  const statCards = [
    {
      label: 'Total de Funções',
      value: stats.total,
      icon: Briefcase,
      color: 'blue',
      description: 'Funções cadastradas'
    },
    {
      label: 'Funções Ativas',
      value: stats.active,
      icon: CheckCircle,
      color: 'green',
      description: 'Disponíveis para uso'
    },
    {
      label: 'Mão de Obra Direta',
      value: stats.direto,
      icon: Building,
      color: 'orange',
      description: 'Funções operacionais'
    },
    {
      label: 'Com Funcionários',
      value: stats.withEmployees,
      icon: UserCheck,
      color: 'purple',
      description: 'Funções em uso'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        icon: 'text-blue-600 dark:text-blue-400',
        text: 'text-blue-900 dark:text-blue-100'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/20',
        icon: 'text-green-600 dark:text-green-400',
        text: 'text-green-900 dark:text-green-100'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        icon: 'text-orange-600 dark:text-orange-400',
        text: 'text-orange-900 dark:text-orange-100'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/20',
        icon: 'text-purple-600 dark:text-purple-400',
        text: 'text-purple-900 dark:text-purple-100'
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const colorClasses = getColorClasses(stat.color)
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${colorClasses.bg}`}>
                    <stat.icon className={`h-6 w-6 ${colorClasses.icon}`} />
                  </div>
                </div>
                
                {/* Barra de progresso para funções ativas */}
                {stat.label === 'Funções Ativas' && stats.total > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-slate-500 mb-1">
                      <span>Ativas</span>
                      <span>{Math.round((stats.active / stats.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(stats.active / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Distribuição para mão de obra direta */}
                {stat.label === 'Mão de Obra Direta' && stats.total > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-slate-500 mb-1">
                      <span>Direto vs Indireto</span>
                      <span>{stats.direto}:{stats.indireto}</span>
                    </div>
                    <div className="flex w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-orange-500 transition-all duration-300"
                        style={{ width: `${(stats.direto / stats.total) * 100}%` }}
                      />
                      <div 
                        className="bg-blue-500 transition-all duration-300"
                        style={{ width: `${(stats.indireto / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
} 
