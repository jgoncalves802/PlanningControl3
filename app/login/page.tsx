'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'

// Fallback para autenticação mock se o contexto não estiver disponível
const useAuthFallback = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Verificar credenciais mock
    if (email === 'admin@demo-company.com' && password === '123456') {
      const mockUser = {
        id: '1',
        name: 'Admin Geral',
        email: email,
        role: 'TENANT_ADMIN',
        isActive: true,
        createdAt: new Date()
      }
      setUser(mockUser)
      localStorage.setItem('user_data', JSON.stringify(mockUser))
      localStorage.setItem('auth_token', 'mock_token')
      return { user: mockUser }
    } else {
      throw new Error('Credenciais inválidas. Use: admin@demo-company.com / 123456')
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simular criação de conta
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: email,
      role: 'OPERATOR',
      isActive: true,
      createdAt: new Date()
    }
    
    setUser(newUser)
    localStorage.setItem('user_data', JSON.stringify(newUser))
    localStorage.setItem('auth_token', 'mock_token')
    return { user: newUser }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('user_data')
    localStorage.removeItem('auth_token')
  }

  const resetPassword = async (email: string) => {
    throw new Error('Funcionalidade de recuperação de senha não implementada')
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  
  const router = useRouter()
  
  // Tentar usar o contexto de autenticação, com fallback
  let auth
  try {
    // Tentar importar dinamicamente para evitar erros de SSR
    const { useAuth } = require('@/lib/contexts/AuthContext')
    auth = useAuth()
  } catch (error) {
    console.log('Usando autenticação fallback')
    auth = useAuthFallback()
  }

  const { signIn, signUp } = auth

  // Verificar se já está logado
  useEffect(() => {
    const userData = localStorage.getItem('user_data')
    const authToken = localStorage.getItem('auth_token')
    
    if (userData && authToken) {
      try {
        const user = JSON.parse(userData)
        if (user && user.email) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Erro ao verificar usuário logado:', error)
        localStorage.removeItem('user_data')
        localStorage.removeItem('auth_token')
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)

    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error('Nome é obrigatório')
        }
        await signUp(email, password, { name })
        toast.success('Conta criada com sucesso!')
        router.push('/dashboard')
      } else {
        await signIn(email, password)
        toast.success('Login realizado com sucesso!')
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Erro na autenticação:', error)
      const errorMessage = error.message || 'Erro na autenticação'
      setAuthError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Criar Conta' : 'Entrar no Sistema'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? 'Crie sua conta para acessar o sistema' : 'Faça login para acessar o sistema'}
          </p>
          
          {/* Informações de credenciais para desenvolvimento */}
          {!isSignUp && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Credenciais de teste:</strong><br />
                Email: admin@demo-company.com<br />
                Senha: 123456
              </p>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isSignUp ? 'Criar Nova Conta' : 'Login'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp ? 'Preencha os dados para criar sua conta' : 'Digite suas credenciais'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-800">{authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome completo"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? 'Criando conta...' : 'Entrando...'}
                  </>
                ) : (
                  isSignUp ? 'Criar Conta' : 'Entrar'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setAuthError(null)
                }}
                className="text-sm"
              >
                {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Criar conta'}
              </Button>
            </div>

            {!isSignUp && (
              <div className="mt-4 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm"
                  onClick={() => {
                    toast('Funcionalidade em desenvolvimento')
                  }}
                >
                  Esqueceu sua senha?
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}