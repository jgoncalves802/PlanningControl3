'use client'

import React, { memo, useEffect, useState } from 'react';
import { Users, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEmployeeStats } from '@/lib/hooks/useEmployeeStats';

const EmployeeStats = memo(function EmployeeStats() {
  const { stats, isLoading, error, refetch, triggerUpdate } = useEmployeeStats();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    console.log('🎯 EmployeeStats - Dados atuais:', stats);
    setLastUpdate(new Date());
  }, [stats]);

  const statsData = [
    { 
      label: 'Total Funcionários', 
      value: stats.totalEmployees, 
      color: 'blue' 
    },
    { 
      label: 'Ativos', 
      value: stats.activeEmployees, 
      color: 'green' 
    },
    { 
      label: 'Em Licença', 
      value: stats.onLeaveEmployees, 
      color: 'yellow' 
    },
    { 
      label: 'Contratações Recentes', 
      value: stats.recentHires, 
      color: 'purple' 
    }
  ];

  const handleRefresh = () => {
    console.log('🔄 Forçando atualização das estatísticas...');
    refetch();
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
      return `${seconds}s atrás`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m atrás`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h atrás`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Estatísticas de Funcionários</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Atualizando...</span>
            <Button onClick={handleRefresh} disabled>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Atualizar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((key) => (
            <Card key={key} className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-200 dark:bg-slate-700 animate-pulse">
                    <div className="h-5 w-5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Estatísticas de Funcionários</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-500">Erro ao carregar</span>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsData.map((stat) => (
            <Card key={stat.label} className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">-</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                    <Users className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Estatísticas de Funcionários</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Última atualização: {formatLastUpdate(lastUpdate)}</span>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <Card key={stat.label} className="bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <Users className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});

export default EmployeeStats; 
