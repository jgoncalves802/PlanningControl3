import type { Metadata, Viewport } from 'next'
import './globals.css'
import ReactQueryProvider from '@/lib/ReactQueryProvider'
import AppProviders from '@/components/providers/AppProviders'

export const metadata: Metadata = {
  title: 'Planning Control',
  description: 'Sistema de controle de planejamento e efetivo',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
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
          <AppProviders>
            {children}
          </AppProviders>
        </ReactQueryProvider>
      </body>
    </html>
  )
}