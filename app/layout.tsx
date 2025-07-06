import type { Metadata } from 'next'
import './globals.css'
import { NextIntlClientProvider, useMessages } from 'next-intl'
import ReactQueryProvider from '@/lib/ReactQueryProvider'

export const metadata: Metadata = {
  title: 'PlanningControl - Workforce Management Platform',
  description: 'Complete multi-tenant workforce and operations management solution',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Carrega as mensagens do idioma atual (SSR/SSG)
  let messages;
  try {
    messages = useMessages();
  } catch {
    messages = undefined;
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background">
        <ReactQueryProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}