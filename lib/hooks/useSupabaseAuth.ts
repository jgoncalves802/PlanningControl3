import { useState, useEffect } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User, UserRole } from '@/lib/auth'

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
        id: 'cmdrema7a0000i84808xbgm2r',
        name: 'Super Administrador',
        email: 'superadmin@planningcontrol.com',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        createdAt: new Date()
      })
      setLoading(false)
      return
    }

    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        if (session?.user) {
          const userData = await transformSupabaseUser(session.user)
          setUser(userData)
        }
      } catch (error) {
        console.error('Erro ao obter sessão:', error)
        // Fallback para usuário mock
        setUser({
          id: '1',
          name: 'Admin Geral',
          email: 'admin@demo-company.com',
          role: UserRole.TENANT_ADMIN,
          isActive: true,
          createdAt: new Date()
        })
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setSession(session)
          if (session?.user) {
            const userData = await transformSupabaseUser(session.user)
            setUser(userData)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Erro ao processar mudança de auth:', error)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Verificar se Supabase está configurado
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'

    if (!isSupabaseConfigured) {
      // Verificar credenciais mock dos super admins
      if (email === 'superadmin@planningcontrol.com' && password === '123456') {
        const mockUser: User = {
          id: 'cmdrema7a0000i84808xbgm2r',
          name: 'Super Administrador',
          email: email,
          role: UserRole.SUPER_ADMIN,
          isActive: true,
          createdAt: new Date()
        }
        setUser(mockUser)
        return { user: mockUser }
      } else if (email === 'admin@planningcontrol.com' && password === '123456') {
        const mockUser: User = {
          id: 'cmdrema9n0001i848l1zltamw',
          name: 'Administrador Regular',
          email: email,
          role: UserRole.TENANT_ADMIN,
          isActive: true,
          createdAt: new Date()
        }
        setUser(mockUser)
        return { user: mockUser }
      } else if (email === 'admin@demo-company.com' && password === '123456') {
        const mockUser: User = {
          id: '1',
          name: 'Admin Geral',
          email: email,
          role: UserRole.TENANT_ADMIN,
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || UserRole.OPERATOR,
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
    // Buscar dados adicionais do usuário no banco
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('clerkId', supabaseUser.id)
      .single()

    // Se não encontrar no banco, criar com dados padrão
    if (!userProfile) {
      const defaultUser: User = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
        email: supabaseUser.email!,
        role: UserRole.OPERATOR,
        isActive: true,
        avatar: supabaseUser.user_metadata?.avatar_url,
        createdAt: new Date(supabaseUser.created_at)
      }
      return defaultUser
    }

    // Mapear dados do banco para nosso formato
    const user: User = {
      id: userProfile.id,
      name: userProfile.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: userProfile.email || supabaseUser.email!,
      role: mapRoleFromDatabase(userProfile.role) || UserRole.OPERATOR,
      isActive: userProfile.isActive ?? true,
      avatar: userProfile.avatar || supabaseUser.user_metadata?.avatar_url,
      createdAt: new Date(userProfile.createdAt || supabaseUser.created_at)
    }

    return user
  } catch (error) {
    console.error('Erro ao transformar usuário:', error)
    // Fallback para usuário padrão
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email!,
      role: UserRole.OPERATOR,
      isActive: true,
      avatar: supabaseUser.user_metadata?.avatar_url,
      createdAt: new Date(supabaseUser.created_at)
    }
  }
}

// Função para mapear roles do banco para nosso enum
function mapRoleFromDatabase(role: string): UserRole {
  switch (role?.toUpperCase()) {
    case 'SUPER_ADMIN':
      return UserRole.SUPER_ADMIN
    case 'TENANT_ADMIN':
      return UserRole.TENANT_ADMIN
    case 'CONTRACT_MANAGER':
      return UserRole.CONTRACT_MANAGER
    case 'HR':
      return UserRole.HR
    case 'PLANNING':
      return UserRole.PLANNING
    case 'SAFETY':
      return UserRole.SAFETY
    case 'SUPERVISOR':
      return UserRole.SUPERVISOR
    case 'OPERATOR':
      return UserRole.OPERATOR
    default:
      return UserRole.OPERATOR
  }
} 