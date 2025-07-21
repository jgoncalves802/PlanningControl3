"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0, // Sempre considerar dados como stale para atualização imediata
        gcTime: 1000 * 60 * 5, // 5 minutos no cache
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchInterval: false, // Não usar polling, apenas SSE
        retry: 1,
      },
      mutations: {
        retry: 1,
      },
    },
  }));
  
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
} 