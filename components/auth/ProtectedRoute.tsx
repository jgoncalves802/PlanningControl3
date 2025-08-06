'use client'

import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { validatePageAccess } from '@/lib/auth-client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER'
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'USER',
  fallback 
}: ProtectedRouteProps) {
  const { user, loading } = useCurrentUser()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔒 ProtectedRoute - Usuário não autenticado, redirecionando para login')
      router.push('/login')
      return
    }

    if (!loading && user) {
      // Verificar se o usuário tem acesso à página específica
      const hasPageAccess = validatePageAccess(user, pathname)
      
      if (!hasPageAccess) {
        console.log('🔒 ProtectedRoute - Acesso negado à página:', pathname)
        console.log('🔒 ProtectedRoute - Usuário:', user.role)
        console.log('🔒 ProtectedRoute - Página:', pathname)
        
        // Redirecionar para dashboard se não tiver acesso
        router.push('/dashboard')
        return
      }
    }
  }, [user, loading, pathname, router])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
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

  // Verificar se o usuário tem acesso à página específica
  const hasPageAccess = validatePageAccess(user, pathname)

  if (!hasPageAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

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
            </div>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
} 