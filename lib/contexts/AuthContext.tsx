'use client'

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import type { User } from '@/lib/types/user'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

// Criar o contexto com um valor padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { throw new Error('AuthProvider not initialized') },
  signUp: async () => { throw new Error('AuthProvider not initialized') },
  signOut: async () => { throw new Error('AuthProvider not initialized') },
  resetPassword: async () => { throw new Error('AuthProvider not initialized') }
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Inicializar com um usuário mock para desenvolvimento
    const mockUser: User = {
      id: 'mock-super-admin-id',
      name: 'Super Administrador',
      email: 'superadmin@planningcontrol.com',
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: new Date()
    }
    
    setUser(mockUser)
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // Verificar credenciais mock
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
    } else {
      throw new Error('Credenciais inválidas. Use: superadmin@planningcontrol.com / 123456')
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    throw new Error('Registro não implementado no modo de desenvolvimento')
  }

  const signOut = async () => {
    setUser(null)
  }

  const resetPassword = async (email: string) => {
    throw new Error('Reset de senha não implementado no modo de desenvolvimento')
  }

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 