'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/contexts/AuthContext'

interface ClientAuthProviderProps {
  children: ReactNode
}

export default function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  return <AuthProvider>{children}</AuthProvider>
} 