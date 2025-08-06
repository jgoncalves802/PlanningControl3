"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutos - mais conservador
        gcTime: 1000 * 60 * 10, // 10 minutos no cache
        refetchOnWindowFocus: false, // Menos agressivo
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchInterval: false, // Não usar polling, apenas SSE
        retry: (failureCount, error) => {
          // Não tentar novamente para erros de rede específicos
          if (error instanceof Error && error.message.includes('ECONNRESET')) {
            return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: (failureCount, error) => {
          // Não tentar novamente para erros de rede específicos
          if (error instanceof Error && error.message.includes('ECONNRESET')) {
            return false;
          }
          return failureCount < 1;
        },
      },
    },
  }));
  
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
} 