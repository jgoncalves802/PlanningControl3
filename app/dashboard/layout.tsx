'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user } = useCurrentUser()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <Toaster position="top-center" />
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}