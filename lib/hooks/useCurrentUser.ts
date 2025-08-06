import { useState, useEffect, useRef } from 'react'
import { getCurrentUser, User } from '@/lib/auth-client'

// Cache persistente usando localStorage
const CACHE_KEY = 'planning_control_user_cache'
const CACHE_TIMESTAMP_KEY = 'planning_control_user_timestamp'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Funções para gerenciar cache persistente
const getCachedUser = (): User | null => {
  try {
    if (typeof window === 'undefined') return null
    
    const cached = localStorage.getItem(CACHE_KEY)
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    
    if (!cached || !timestamp) return null
    
    const now = Date.now()
    const cacheTime = parseInt(timestamp)
    
    // Verificar se cache ainda é válido
    if (now - cacheTime > CACHE_DURATION) {
      // Cache expirado, limpar
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_TIMESTAMP_KEY)
      return null
    }
    
    return JSON.parse(cached)
  } catch (error) {
    console.error('Erro ao ler cache do usuário:', error)
    return null
  }
}

const setCachedUser = (user: User): void => {
  try {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(user))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
  } catch (error) {
    console.error('Erro ao salvar cache do usuário:', error)
  }
}

const clearCachedUser = (): void => {
  try {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIMESTAMP_KEY)
  } catch (error) {
    console.error('Erro ao limpar cache do usuário:', error)
  }
}

export function useCurrentUser() {
  // Verificar se estamos no cliente e se React está disponível
  if (typeof window === 'undefined' || typeof useState === 'undefined') {
    console.log('[useCurrentUser] Renderização no servidor ou React não disponível');
    return {
      user: null,
      loading: true,
      refreshUser: async () => {}
    }
  }

  // Verificar se estamos dentro de um componente React
  try {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const fetchingRef = useRef(false)

    useEffect(() => {
      const fetchUser = async () => {
        // Evitar múltiplas chamadas simultâneas
        if (fetchingRef.current) {
          console.log('[useCurrentUser] Fetch já em andamento, ignorando');
          return
        }
        
        console.log('[useCurrentUser] Iniciando busca do usuário');
        
        fetchingRef.current = true
        
        try {
          console.log('[useCurrentUser] Buscando usuário do servidor...');
          const currentUser = await getCurrentUser()
          
          if (currentUser) {
            console.log('[useCurrentUser] Usuário autenticado encontrado');
            setUser(currentUser)
          } else {
            console.log('[useCurrentUser] Nenhum usuário autenticado');
            setUser(null)
          }
        } catch (error) {
          console.error('[useCurrentUser] Erro ao obter usuário atual:', error)
          setUser(null)
        } finally {
          setLoading(false)
          fetchingRef.current = false
          console.log('[useCurrentUser] Busca finalizada');
        }
      }

      fetchUser()
    }, [])

    // Função para forçar refresh do usuário
    const refreshUser = async () => {
      console.log('[useCurrentUser] Forçando refresh do usuário');
      setLoading(true)
      
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          console.log('[useCurrentUser] Usuário atualizado com sucesso');
          setUser(currentUser)
        } else {
          console.log('[useCurrentUser] Usuário removido');
          setUser(null)
        }
      } catch (error) {
        console.error('[useCurrentUser] Erro ao atualizar usuário:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    return { user, loading, refreshUser }
  } catch (error) {
    console.error('[useCurrentUser] Erro ao inicializar hook:', error)
    return {
      user: null,
      loading: true,
      refreshUser: async () => {}
    }
  }
} 