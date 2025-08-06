import { useState, useEffect } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Interface para o novo sistema de usuário
export interface User {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER'
  companyId?: string
  isActive: boolean
  avatar?: string
  createdAt: Date
}

// Singleton para o cliente Supabase
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se Supabase está configurado
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'

    if (!isSupabaseConfigured) {
      // Usar super admin como usuário padrão se Supabase não estiver configurado
      setUser({
        id: 'mock-super-admin-id',
        name: 'Super Administrador',
        email: 'superadmin@planningcontrol.com',
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: new Date()
      })
      setLoading(false)
      return
    }

    const supabase = getSupabaseClient()
    let subscription: any = null

    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        console.log('[useSupabaseAuth] Obtendo sessão inicial...');
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        if (session?.user) {
          console.log('[useSupabaseAuth] Usuário encontrado na sessão');
          const userData = await transformSupabaseUser(session.user)
          setUser(userData)
        } else {
          console.log('[useSupabaseAuth] Nenhum usuário na sessão');
          setUser(null)
        }
      } catch (error) {
        console.error('[useSupabaseAuth] Erro ao obter sessão:', error)
        // Fallback para usuário mock
        setUser({
          id: 'mock-admin-id',
          name: 'Admin Geral',
          email: 'admin@demo-company.com',
          role: 'COMPANY_ADMIN',
          isActive: true,
          createdAt: new Date()
        })
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          try {
            console.log('[useSupabaseAuth] Mudança de auth detectada:', event);
            setSession(session)
            if (session?.user) {
              const userData = await transformSupabaseUser(session.user)
              setUser(userData)
            } else {
              setUser(null)
            }
          } catch (error) {
            console.error('[useSupabaseAuth] Erro ao processar mudança de auth:', error)
          } finally {
            setLoading(false)
          }
        }
      )
      subscription = authSubscription
    } catch (error) {
      console.error('[useSupabaseAuth] Erro ao configurar listener de auth:', error)
    }

    return () => {
      console.log('[useSupabaseAuth] Limpando subscription...');
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.warn('[useSupabaseAuth] Erro ao limpar subscription:', error)
        }
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    // Verificar se Supabase está configurado
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'

    if (!isSupabaseConfigured) {
      // Verificar credenciais mock dos super admins
      if (email === 'superadmin@planningcontrol.com' && password === '123456') {
        const mockUser: User = {
          id: 'mock-super-admin-id',
          name: 'Super Administrador',
          email: email,
          role: 'SUPER_ADMIN',
          isActive: true,
          createdAt: new Date()
        }
        setUser(mockUser)
        return { user: mockUser }
      } else if (email === 'admin@planningcontrol.com' && password === '123456') {
        const mockUser: User = {
          id: 'mock-admin-id',
          name: 'Administrador Regular',
          email: email,
          role: 'COMPANY_ADMIN',
          isActive: true,
          createdAt: new Date()
        }
        setUser(mockUser)
        return { user: mockUser }
      } else if (email === 'admin@demo-company.com' && password === '123456') {
        const mockUser: User = {
          id: 'mock-company-admin-id',
          name: 'Admin Geral',
          email: email,
          role: 'COMPANY_ADMIN',
          isActive: true,
          createdAt: new Date()
        }
        setUser(mockUser)
        return { user: mockUser }
      } else {
        throw new Error('Credenciais inválidas. Use: superadmin@planningcontrol.com / 123456 ou admin@planningcontrol.com / 123456')
      }
    }

    // Usar autenticação real do Supabase
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Erro no login Supabase:', error)
        throw error
      }
      
      if (data.user) {
        const userData = await transformSupabaseUser(data.user)
        setUser(userData)
        return { user: userData }
      }
      
      throw new Error('Falha na autenticação')
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    // Verificar se Supabase está configurado
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'

    if (!isSupabaseConfigured) {
      throw new Error('Supabase não está configurado. Configure as variáveis de ambiente primeiro.')
    }

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'USER',
            isActive: true
          }
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    }
  }

  const signOut = async () => {
    // Verificar se Supabase está configurado
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'

    if (!isSupabaseConfigured) {
      // Simular logout
      setUser(null)
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    // Verificar se Supabase está configurado
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'

    if (!isSupabaseConfigured) {
      throw new Error('Supabase não está configurado. Configure as variáveis de ambiente primeiro.')
    }

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
    } catch (error) {
      console.error('Erro no reset de senha:', error)
      throw error
    }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }
}

// Função para transformar usuário do Supabase para nosso formato
async function transformSupabaseUser(supabaseUser: SupabaseUser): Promise<User> {
  try {
    // Criar usuário padrão baseado nos dados do Supabase
    const defaultUser: User = {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email!,
      role: 'SUPER_ADMIN', // Usar SUPER_ADMIN como padrão para desenvolvimento
      isActive: true,
      avatar: supabaseUser.user_metadata?.avatar_url,
      createdAt: new Date(supabaseUser.created_at)
    }
    
    console.log('[useSupabaseAuth] Usuário transformado:', defaultUser);
    return defaultUser
  } catch (error) {
    console.error('[useSupabaseAuth] Erro ao transformar usuário:', error)
    
    // Fallback em caso de erro
    const fallbackUser: User = {
      id: supabaseUser.id,
      name: 'Super Administrador',
      email: supabaseUser.email!,
      role: 'SUPER_ADMIN',
      isActive: true,
      avatar: supabaseUser.user_metadata?.avatar_url,
      createdAt: new Date(supabaseUser.created_at)
    }
    
    return fallbackUser
  }
}

// Função para mapear roles do banco para nosso novo sistema
function mapRoleFromDatabase(role: string): 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER' {
  switch (role?.toUpperCase()) {
    case 'SUPER_ADMIN':
      return 'SUPER_ADMIN'
    case 'COMPANY_ADMIN':
      return 'COMPANY_ADMIN'
    case 'USER':
      return 'USER'
    default:
      return 'USER'
  }
} 