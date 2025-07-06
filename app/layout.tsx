import type { Metadata } from 'next'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import ReactQueryProvider from '@/lib/ReactQueryProvider'

export const metadata: Metadata = {
  title: 'PlanningControl - Workforce Management Platform',
  description: 'Complete multi-tenant workforce and operations management solution',
  viewport: 'width=device-width, initial-scale=1',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Carrega as mensagens do idioma atual no servidor
  const messages = await getMessages();

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