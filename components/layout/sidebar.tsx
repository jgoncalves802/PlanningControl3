'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppSettings } from '@/lib/contexts/AppSettingsContext'
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
  },
  {
    title: 'Funcionários',
    href: '/dashboard/employees',
    icon: Users,
  },
  {
    title: 'Contratos',
    href: '/dashboard/contracts',
    icon: Building,
  },
  {
    title: 'Orçamentos',
    href: '/dashboard/budgets',
    icon: Calculator,
  },
  {
    title: 'Segurança',
    href: '/dashboard/safety',
    icon: Shield,
  },
  {
    title: 'Planejamento',
    href: '/dashboard/planning',
    icon: Calendar,
  },
  {
    title: 'Transferências',
    href: '/dashboard/transfers',
    icon: ArrowRightLeft,
  },
  {
    title: 'Alocação de Efetivo',
    href: '/dashboard/employee-assignment',
    icon: UserCheck,
  },
  {
    title: 'Controle de Efetivo',
    href: '/dashboard/workforce-control',
    icon: Users,
  },
  {
    title: 'Gestão NFC',
    href: '/dashboard/nfc-management',
    icon: Smartphone,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'Backup',
    href: '/dashboard/backup',
    icon: Database,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { settings } = useAppSettings()
  const [isCollapsed, setIsCollapsed] = useState(settings.sidebarCollapsed)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className={cn(
      "sidebar bg-background border-r border-border transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold sidebar-text">Planning Control</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="sidebar-text">{item.title}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          {!isCollapsed && (
            <div className="text-xs text-muted-foreground sidebar-text">
              Planning Control v1.0
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Export nomeado para compatibilidade
export { Sidebar }
