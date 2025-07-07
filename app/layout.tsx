import type { Metadata, Viewport } from 'next'
import './globals.css'
import ReactQueryProvider from '@/lib/ReactQueryProvider'

export const metadata: Metadata = {
  title: 'PlanningControl - Workforce Management Platform',
  description: 'Complete multi-tenant workforce and operations management solution',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background">
        <ReactQueryProvider>
            {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}