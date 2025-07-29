'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Building2, 
  Lock,
  Mail,
  User,
  Sparkles,
  Star,
  ArrowLeft,
  ArrowRight,
  Cog,
  Zap,
  Settings
} from 'lucide-react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                PlanningControl
              </span>
            </Link>
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Two Columns */}
      <div className="relative z-10 flex min-h-[calc(100vh-120px)] items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Industrial Art */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:flex flex-col items-center justify-center relative"
          >
            {/* Industrial Art Container */}
            <div className="relative w-full max-w-lg h-96">
              
              {/* Main Gear */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48"
              >
                <div className="w-full h-full border-8 border-gray-300 rounded-full relative">
                  {/* Gear Teeth */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-4 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-sm"
                      style={{
                        top: '-4px',
                        left: '50%',
                        transform: `translateX(-50%) rotate(${i * 30}deg) translateY(-24px)`,
                        transformOrigin: 'center 24px'
                      }}
                    />
                  ))}
                  {/* Center Circle */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <Cog className="h-8 w-8 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Small Gears */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-8 left-8 w-20 h-20"
              >
                <div className="w-full h-full border-4 border-gray-400 rounded-full relative">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-4 bg-gradient-to-b from-gray-500 to-gray-700 rounded-sm"
                      style={{
                        top: '-2px',
                        left: '50%',
                        transform: `translateX(-50%) rotate(${i * 45}deg) translateY(-12px)`,
                        transformOrigin: 'center 12px'
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-8 right-8 w-16 h-16"
              >
                <div className="w-full h-full border-3 border-gray-400 rounded-full relative">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-3 bg-gradient-to-b from-gray-500 to-gray-700 rounded-sm"
                      style={{
                        top: '-1.5px',
                        left: '50%',
                        transform: `translateX(-50%) rotate(${i * 60}deg) translateY(-10px)`,
                        transformOrigin: 'center 10px'
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                <line
                  x1="25%"
                  y1="25%"
                  x2="75%"
                  y2="75%"
                  stroke="url(#gradient1)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
                <line
                  x1="75%"
                  y1="25%"
                  x2="25%"
                  y2="75%"
                  stroke="url(#gradient2)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                  style={{ animationDelay: '1s' }}
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 right-1/4 w-3 h-3 bg-blue-500 rounded-full shadow-lg"
              />
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/4 left-4 w-2 h-2 bg-indigo-500 rounded-full shadow-lg"
              />
              <motion.div
                animate={{ y: [-5, 15, -5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/3 right-4 w-2.5 h-2.5 bg-blue-400 rounded-full shadow-lg"
              />

              {/* Circuit Lines */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-px h-16 bg-gradient-to-b from-blue-600 to-transparent" />
                <div className="absolute bottom-0 right-1/4 w-px h-16 bg-gradient-to-t from-indigo-600 to-transparent" />
                <div className="absolute top-1/4 left-0 w-16 h-px bg-gradient-to-r from-blue-600 to-transparent" />
                <div className="absolute bottom-1/4 right-0 w-16 h-px bg-gradient-to-l from-indigo-600 to-transparent" />
              </div>
            </div>

            {/* Industrial Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-center mt-8 space-y-4"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-full text-sm font-medium text-gray-700">
                <Zap className="h-4 w-4 text-blue-600" />
                Revolução Industrial Digital
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Gestão Inteligente
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                Tecnologia avançada para otimizar processos industriais e maximizar a eficiência operacional
              </p>
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center lg:justify-start"
          >
            <div className="w-full max-w-md">
              
              {/* Header */}
              <div className="text-center lg:text-left mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
                >
                  <Sparkles className="h-4 w-4" />
                  {isSignUp ? 'Criar Nova Conta' : 'Acesso ao Sistema'}
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl font-bold text-gray-900 mb-4"
                >
                  {isSignUp ? 'Junte-se ao PlanningControl' : 'Bem-vindo de volta'}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-lg text-gray-600 leading-relaxed"
                >
                  {isSignUp 
                    ? 'Crie sua conta e comece a gerenciar seu workforce de forma inteligente'
                    : 'Faça login para acessar sua plataforma de gestão de efetivo'
                  }
                </motion.p>
              </div>

              {/* Login Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl font-bold text-center text-gray-900">
                      {isSignUp ? 'Criar Conta' : 'Entrar'}
                    </CardTitle>
                    <CardDescription className="text-center text-gray-600">
                      {isSignUp ? 'Preencha os dados para criar sua conta' : 'Digite suas credenciais de acesso'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3"
                      >
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-800 font-medium">{authError}</p>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {isSignUp && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Nome Completo
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="name"
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Digite seu nome completo"
                              required={isSignUp}
                              className="pl-10 h-12 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </motion.div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="pl-10 h-12 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                          Senha
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha"
                            required
                            className="pl-10 pr-12 h-12 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              {isSignUp ? 'Criando conta...' : 'Entrando...'}
                            </>
                          ) : (
                            <>
                              {isSignUp ? 'Criar Conta' : 'Entrar'}
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>

                    {/* Toggle Sign Up/Login */}
                    <div className="text-center pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setIsSignUp(!isSignUp)
                          setAuthError(null)
                        }}
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Criar conta'}
                      </Button>
                    </div>

                    {/* Forgot Password */}
                    {!isSignUp && (
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                          onClick={() => {
                            toast('Funcionalidade em desenvolvimento')
                          }}
                        >
                          Esqueceu sua senha?
                        </Button>
                      </div>
                    )}

                    {/* Demo Credentials */}
                    {!isSignUp && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-900">Credenciais de Teste</span>
                        </div>
                        <div className="text-sm text-blue-800 space-y-1">
                          <div><strong>Email:</strong> admin@demo-company.com</div>
                          <div><strong>Senha:</strong> 123456</div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">PlanningControl</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Termos</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}