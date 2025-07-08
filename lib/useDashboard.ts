import { useQuery } from '@tanstack/react-query'
import { DashboardStats } from './types/dashboard'

// Fetch dashboard statistics
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/api/dashboard/stats')
  
  if (!response.ok) {
    throw new Error('Falha ao carregar estatísticas do dashboard')
  }
  
  return response.json()
}

// Hook to get dashboard statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
} 