'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Shield, 
  ArrowLeftRight,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Calendar,
  CreditCard,
  UserPlus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Funcionários', href: '/dashboard/employees', icon: Users },
  { name: 'Alocação de Efetivo', href: '/dashboard/employee-assignment', icon: UserPlus },
  { name: 'Contratos', href: '/dashboard/contracts', icon: FileText },
  { name: 'Planejamento', href: '/dashboard/planning', icon: Calendar },
  { name: 'Controle de Efetivo', href: '/dashboard/workforce-control', icon: UserCheck },
  { name: 'Crachás NFC', href: '/dashboard/nfc-management', icon: CreditCard },
  { name: 'Transferências', href: '/dashboard/transfers', icon: ArrowLeftRight },
  { name: 'Segurança', href: '/dashboard/safety', icon: Shield },
  { name: 'Análises', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-slate-100">PlanningControl</h1>
                <p className="text-xs text-gray-500 dark:text-slate-400">Empresa Demo</p>
              </div>
            </motion.div>
          )}
          
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-slate-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {item.name}
                </motion.span>
              )}
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600 rounded-lg -z-10"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-gray-500 dark:text-slate-400 text-center"
          >
            v3.0.0
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}