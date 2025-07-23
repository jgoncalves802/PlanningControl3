import { useState, useEffect, useCallback } from 'react';

interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  recentHires: number;
}

export function useEmployeeStats() {
  const [stats, setStats] = useState<EmployeeStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveEmployees: 0,
    recentHires: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      console.log('🔄 Buscando estatísticas de funcionários...');
      setIsLoading(true);
      setError(null);
      
      const timestamp = Date.now();
      const response = await fetch(`/api/employees/stats?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }
      
      const data = await response.json();
      console.log('📊 Estatísticas recebidas:', data);
      setStats(data);
    } catch (err) {
      console.error('❌ Erro ao buscar estatísticas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualização inicial
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Atualização automática a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Atualização automática das estatísticas...');
      fetchStats();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [fetchStats]);

  // Listener para eventos de atualização
  useEffect(() => {
    const handleStatsUpdate = () => {
      console.log('📡 Evento de atualização recebido, atualizando estatísticas...');
      fetchStats();
    };

    // Adicionar listener para eventos customizados
    window.addEventListener('employee-stats-update', handleStatsUpdate);
    
    // Adicionar listener para mudanças de foco na janela
    const handleFocus = () => {
      console.log('🪟 Janela focada, atualizando estatísticas...');
      fetchStats();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('employee-stats-update', handleStatsUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchStats]);

  const refetch = useCallback(() => {
    console.log('🔄 Refetch manual das estatísticas...');
    fetchStats();
  }, [fetchStats]);

  // Função para disparar evento de atualização
  const triggerUpdate = useCallback(() => {
    console.log('🚀 Disparando evento de atualização...');
    window.dispatchEvent(new CustomEvent('employee-stats-update'));
  }, []);

  return { stats, isLoading, error, refetch, triggerUpdate };
} 