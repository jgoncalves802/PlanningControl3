import { useAuth } from '@/lib/contexts/AuthContext'

export function useCurrentUser() {
  const { user, loading } = useAuth()
  
  return { 
    user, 
    loading, 
    refreshUser: async () => {
      // Para compatibilidade, mas o refresh é gerenciado pelo contexto
      console.log('[useCurrentUser] Refresh solicitado via contexto')
    }
  }
} 