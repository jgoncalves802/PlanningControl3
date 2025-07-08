'use client';

import { useNFCBadgeStatsQuery } from '@/lib/useNFCBadges';
import { Card } from '@/components/ui/card';
import { Badge, CreditCard, Users, UserCheck, UserX, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export default function NFCBadgeStats() {
  const { data: stats, isLoading, error } = useNFCBadgeStatsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 mb-6">
        <div className="text-red-600">Erro ao carregar estatísticas</div>
      </Card>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total de Crachás',
      value: stats.total,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Crachás cadastrados',
    },
    {
      title: 'Disponíveis',
      value: stats.available,
      icon: Badge,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Prontos para uso',
    },
    {
      title: 'Atribuídos',
      value: stats.assigned,
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Em uso por funcionários',
    },
    {
      title: 'Funcionários com Crachás',
      value: stats.activeEmployeesWithBadges,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Funcionários ativos',
    },
    {
      title: 'Sem Crachás',
      value: stats.employeesWithoutBadges,
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Funcionários pendentes',
    },
    {
      title: 'Revogados',
      value: stats.revoked,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Crachás bloqueados',
    },
    {
      title: 'Atribuições Recentes',
      value: stats.recentlyAssigned,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Últimos 30 dias',
    },
    {
      title: 'Revogações Recentes',
      value: stats.recentlyRevoked,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Últimos 30 dias',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
} 