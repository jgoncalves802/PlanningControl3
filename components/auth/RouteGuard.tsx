'use client'

import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { validatePageAccess, validateGranularPermission } from '@/lib/auth-client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2, Shield, AlertTriangle, Home, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RouteGuardProps {
  children: React.ReactNode
  requiredPermission?: 'view' | 'edit' | 'delete' | 'create' | 'export' | 'import'
  fallbackRoute?: string
}

export default function RouteGuard({ 
  children, 
  requiredPermission = 'view',
  fallbackRoute 
}: RouteGuardProps) {
  const { user, loading } = useCurrentUser()
  const pathname = usePathname()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return

      if (!user) {
        console.log('🔒 RouteGuard - Usuário não autenticado, redirecionando para login')
        router.push('/login')
        return
      }

      // Verificar acesso à página
      const pageAccess = validatePageAccess(user, pathname)
      
      if (!pageAccess) {
        console.log('🔒 RouteGuard - Acesso negado à página:', pathname)
        setHasAccess(false)
        setIsChecking(false)
        return
      }

      // Se há permissão específica requerida, verificar
      if (requiredPermission !== 'view') {
        const hasGranularPermission = validateGranularPermission(user, pathname, requiredPermission)
        if (!hasGranularPermission) {
          console.log(`🔒 RouteGuard - Permissão ${requiredPermission} negada para:`, pathname)
          setHasAccess(false)
          setIsChecking(false)
          return
        }
      }

      setHasAccess(true)
      setIsChecking(false)
    }

    checkAccess()
  }, [user, loading, pathname, router, requiredPermission])

  // Mostrar loading enquanto verifica
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Se não há usuário, mostrar loading (será redirecionado)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Se não tem acesso, mostrar tela de acesso negado
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Acesso Negado
            </CardTitle>
            <CardDescription className="text-gray-600">
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4 text-sm text-gray-500">
              <p><strong>Usuário:</strong> {user.name}</p>
              <p><strong>Nível:</strong> {user.role}</p>
              <p><strong>Página:</strong> {pathname}</p>
              {requiredPermission !== 'view' && (
                <p><strong>Permissão Requerida:</strong> {requiredPermission}</p>
              )}
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              {user.role === 'SUPER_ADMIN' && (
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard/settings')}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
} 