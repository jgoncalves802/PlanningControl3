import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User as SupabaseUser } from '@supabase/supabase-js'

// Interface para o usuário do sistema
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

// Função para obter usuário atual no servidor (API routes)
export async function getCurrentUserServer(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.warn('Usuário não autenticado no servidor:', error?.message)
      return null
    }

    // Transformar usuário do Supabase para nosso formato
    const transformedUser = await transformSupabaseUser(user)
    return transformedUser
  } catch (error) {
    console.error('Erro ao obter usuário atual no servidor:', error)
    return null
  }
}

// Função para obter sessão atual no servidor
export async function getServerSession() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      console.log('❌ Sessão não encontrada:', error?.message);
      return null
    }

    // Transformar a sessão para incluir o usuário no formato esperado
    const transformedUser = await transformSupabaseUser(session.user)
    
    return {
      ...session,
      user: transformedUser
    }
  } catch (error) {
    console.error('Erro ao obter sessão do servidor:', error)
    return null
  }
}

// Função para transformar usuário do Supabase para nosso formato (versão servidor)
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
    
    console.log('[auth-server] Usuário transformado:', defaultUser);
    return defaultUser
  } catch (error) {
    console.error('[auth-server] Erro ao transformar usuário:', error)
    
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

// Função para mapear roles do banco para nosso sistema
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

// Função para obter permissões do usuário
export function getUserPermissions(user: User | null) {
  if (!user) return { canRead: false, canWrite: false, canDelete: false, canAdmin: false }

  switch (user.role) {
    case 'SUPER_ADMIN':
      return {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canAdmin: true,
        canManageUsers: true,
        canManageCompanies: true
      }
    case 'COMPANY_ADMIN':
      return {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canAdmin: true,
        canManageUsers: false,
        canManageCompanies: false
      }
    case 'USER':
      return {
        canRead: true,
        canWrite: false,
        canDelete: false,
        canAdmin: false,
        canManageUsers: false,
        canManageCompanies: false
      }
    default:
      return {
        canRead: false,
        canWrite: false,
        canDelete: false,
        canAdmin: false,
        canManageUsers: false,
        canManageCompanies: false
      }
  }
} 