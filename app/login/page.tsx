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
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  
  const router = useRouter()
  const { signIn, signUp, signOut, user, loading } = useSupabaseAuth()

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        // Cadastro
        const result = await signUp(email, password, { name, companyId: company })
        if (result?.user) {
          toast.success('Conta criada com sucesso! Verifique seu email.')
          setIsSignUp(false)
        }
      } else {
        // Login
        const result = await signIn(email, password)
        if (result?.user) {
          toast.success('Login realizado com sucesso!')
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error)
      toast.error(error.message || 'Erro na autenticação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setIsLoading(true)

    try {
      const result = await signIn(demoEmail, demoPassword)
      if (result?.user) {
        toast.success('Login demo realizado com sucesso!')
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Erro no login demo:', error)
      toast.error('Erro no login demo. Verifique as credenciais.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
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

                      {isSignUp && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                            Empresa
                          </Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="company"
                              type="text"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              placeholder="Nome da empresa"
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
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Criar conta'}
                      </Button>
                    </div>

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
                        <div className="text-sm text-blue-800 space-y-2">
                          <div>
                            <strong>Super Admin:</strong>
                            <div className="ml-2">Email: superadmin@planningcontrol.com</div>
                            <div className="ml-2">Senha: 123456</div>
                          </div>
                          <div>
                            <strong>Admin Regular:</strong>
                            <div className="ml-2">Email: admin@planningcontrol.com</div>
                            <div className="ml-2">Senha: 123456</div>
                          </div>
                          <div>
                            <strong>Admin Empresa:</strong>
                            <div className="ml-2">Email: admin@demo-company.com</div>
                            <div className="ml-2">Senha: 123456</div>
                          </div>
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