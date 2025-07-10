import type { Metadata, Viewport } from 'next'
import './globals.css'
import ReactQueryProvider from '@/lib/ReactQueryProvider'

export const metadata: Metadata = {
  title: 'PlanningControl - Workforce Management Platform',
  description: 'Complete multi-tenant workforce and operations management solution',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased min-h-screen bg-background">
        <ReactQueryProvider>
            {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}