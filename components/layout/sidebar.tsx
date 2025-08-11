'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppSettings } from '@/lib/contexts/AppSettingsContext'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { validatePageAccess, validateGranularPermission } from '@/lib/auth-client'
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Building,
  Shield,
  Settings,
  BarChart3,
  Calendar,
  FileText,
  MapPin,
  Smartphone,
  ArrowRightLeft,
  UserCheck,
  Calculator,
  Database
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    requiredPermission: 'view'
  },
  {
    title: 'Funcionários',
    href: '/dashboard/employees',
    icon: Users,
    requiredPermission: 'view'
  },
  {
    title: 'Contratos',
    href: '/dashboard/contracts',
    icon: Building,
    requiredPermission: 'view'
  },
  {
    title: 'Orçamentos',
    href: '/dashboard/budgets',
    icon: Calculator,
    requiredPermission: 'view'
  },
  {
    title: 'Segurança',
    href: '/dashboard/safety',
    icon: Shield,
    requiredPermission: 'view'
  },
  {
    title: 'Planejamento',
    href: '/dashboard/planning',
    icon: Calendar,
    requiredPermission: 'view'
  },
  {
    title: 'Transferências',
    href: '/dashboard/transfers',
    icon: ArrowRightLeft,
    requiredPermission: 'view'
  },
  {
    title: 'Alocação de Efetivo',
    href: '/dashboard/employee-assignment',
    icon: UserCheck,
    requiredPermission: 'view'
  },
  {
    title: 'Controle de Efetivo',
    href: '/dashboard/workforce-control',
    icon: Users,
    requiredPermission: 'view'
  },
  {
    title: 'Gestão NFC',
    href: '/dashboard/nfc-management',
    icon: Smartphone,
    requiredPermission: 'view'
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    requiredPermission: 'view'
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
    requiredPermission: 'view'
  },
  {
    title: 'Backup',
    href: '/dashboard/backup',
    icon: Database,
    requiredPermission: 'view'
  }
]

// Função para verificar se uma página deve ser oculta (todas as permissões false)
function shouldHidePage(user: any, page: string): boolean {
  if (!user || !user.permissions) return false

  // Mapear href para chave de permissão
  const pageKeyMap: Record<string, keyof typeof user.permissions> = {
    '/dashboard': 'dashboard',
    '/dashboard/employees': 'employees',
    '/dashboard/contracts': 'contracts',
    '/dashboard/budgets': 'budgets',
    '/dashboard/safety': 'safety',
    '/dashboard/planning': 'planning',
    '/dashboard/transfers': 'transfers',
    '/dashboard/employee-assignment': 'employeeAssignment',
    '/dashboard/workforce-control': 'workforceControl',
    '/dashboard/nfc-management': 'nfcManagement',
    '/dashboard/analytics': 'analytics',
    '/dashboard/settings': 'settings',
    '/dashboard/backup': 'backup'
  }

  const pageKey = pageKeyMap[page]
  if (!pageKey) return false

  const pagePermissions = user.permissions[pageKey]
  if (!pagePermissions) return false

  // Se é um objeto de permissões (página)
  if (typeof pagePermissions === 'object' && pagePermissions.canView !== undefined) {
    const allPermissions = ['canView', 'canEdit', 'canDelete', 'canCreate', 'canExport', 'canImport']
    
    // Verificar se todas as permissões estão false
    return allPermissions.every(perm => !pagePermissions[perm])
  }

  // Se é uma permissão booleana simples
  return !pagePermissions
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useCurrentUser()
  const { sidebarCollapsed, setSidebarCollapsed } = useAppSettings()

  // Filtrar itens baseado nas permissões do usuário
  const filteredMenuItems = menuItems.filter(item => {
    // Verificar se o usuário tem acesso à página
    const hasPageAccess = validatePageAccess(user, item.href)
    
    // Verificar se a página deve ser oculta (todas as permissões false)
    const shouldHide = shouldHidePage(user, item.href)
    
    if (!hasPageAccess) {
      console.log(`🔒 Sidebar - Ocultando item ${item.title} (sem permissão)`)
      return false
    }
    
    if (shouldHide) {
      console.log(`🔒 Sidebar - Ocultando item ${item.title} (todas as permissões desabilitadas)`)
      return false
    }
    
    return true
  })

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
      sidebarCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">Planning Control</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="ml-auto"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span>{item.title}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>Usuário: {user?.name || 'Carregando...'}</p>
              <p>Nível: {user?.role || 'Carregando...'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Export nomeado para compatibilidade
export { Sidebar }
