'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Calendar, Target, BarChart3, PieChart, Activity } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface BudgetMetrics {
  totalBudgets: number;
  totalValue: number;
  averageValue: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  monthlyGrowth: number;
  conversionRate: number;
}

interface BudgetDashboardProps {
  budgets: any[];
  onFilterChange?: (filters: any) => void;
}

export default function BudgetDashboard({ budgets, onFilterChange }: BudgetDashboardProps) {
  const [filters, setFilters] = useState({
    period: '30d',
    status: 'all',
    projectType: 'all',
  });

  const [metrics, setMetrics] = useState<BudgetMetrics>({
    totalBudgets: 0,
    totalValue: 0,
    averageValue: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    monthlyGrowth: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    calculateMetrics();
  }, [budgets, filters]);

  const calculateMetrics = () => {
    const filteredBudgets = filterBudgets(budgets, filters);
    
    const totalBudgets = filteredBudgets.length;
    const totalValue = filteredBudgets.reduce((sum, budget) => sum + (budget.totalValue || 0), 0);
    const averageValue = totalBudgets > 0 ? totalValue / totalBudgets : 0;
    
    const approvedCount = filteredBudgets.filter(b => b.status === 'APPROVED').length;
    const pendingCount = filteredBudgets.filter(b => b.status === 'PENDING').length;
    const rejectedCount = filteredBudgets.filter(b => b.status === 'REJECTED').length;
    
    const conversionRate = totalBudgets > 0 ? (approvedCount / totalBudgets) * 100 : 0;
    
    // Calcular crescimento mensal (simulado)
    const monthlyGrowth = calculateMonthlyGrowth(filteredBudgets);
    
    setMetrics({
      totalBudgets,
      totalValue,
      averageValue,
      approvedCount,
      pendingCount,
      rejectedCount,
      monthlyGrowth,
      conversionRate,
    });
  };

  const filterBudgets = (budgets: any[], filters: any) => {
    let filtered = [...budgets];
    
    // Filtro por período
    if (filters.period !== 'all') {
      const days = filters.period === '7d' ? 7 : filters.period === '30d' ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(budget => {
        const budgetDate = new Date(budget.createdAt);
        return budgetDate >= cutoffDate;
      });
    }
    
    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(budget => budget.status === filters.status);
    }
    
    // Filtro por tipo de projeto
    if (filters.projectType !== 'all') {
      filtered = filtered.filter(budget => budget.projectType === filters.projectType);
    }
    
    return filtered;
  };

  const calculateMonthlyGrowth = (budgets: any[]) => {
    if (budgets.length < 2) return 0;
    
    // Simular cálculo de crescimento (em uma implementação real, seria baseado em dados históricos)
    const currentMonth = budgets.filter(b => {
      const date = new Date(b.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    
    const lastMonth = budgets.filter(b => {
      const date = new Date(b.createdAt);
      const now = new Date();
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return date.getMonth() === lastMonth && date.getFullYear() === lastYear;
    }).length;
    
    if (lastMonth === 0) return currentMonth > 0 ? 100 : 0;
    
    return ((currentMonth - lastMonth) / lastMonth) * 100;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Dashboard de Orçamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Período</Label>
              <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="APPROVED">Aprovado</SelectItem>
                  <SelectItem value="REJECTED">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Tipo de Projeto</Label>
              <Select value={filters.projectType} onValueChange={(value) => setFilters({ ...filters, projectType: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="construcao">Construção</SelectItem>
                  <SelectItem value="reforma">Reforma</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="instalacao">Instalação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total de Orçamentos</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(metrics.totalBudgets)}</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getGrowthIcon(metrics.monthlyGrowth)}
              <span className={`text-sm font-medium ${getGrowthColor(metrics.monthlyGrowth)}`}>
                {formatPercentage(Math.abs(metrics.monthlyGrowth))}
              </span>
              <span className="text-xs text-gray-600">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Valor Total</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(metrics.totalValue)}</p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-green-600">
                Média: {formatCurrency(metrics.averageValue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-purple-900">{formatPercentage(metrics.conversionRate)}</p>
              </div>
              <div className="p-2 bg-purple-200 rounded-lg">
                <Target className="w-6 h-6 text-purple-700" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-purple-600">
                {metrics.approvedCount} aprovados de {metrics.totalBudgets}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Status</p>
                <p className="text-2xl font-bold text-orange-900">{metrics.pendingCount}</p>
              </div>
              <div className="p-2 bg-orange-200 rounded-lg">
                <Activity className="w-6 h-6 text-orange-700" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-orange-600">
                {metrics.approvedCount} aprovados, {metrics.rejectedCount} rejeitados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PieChart className="w-5 h-5 text-blue-600" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Aprovados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{metrics.approvedCount}</span>
                  <span className="text-sm text-gray-500">
                    ({formatPercentage(metrics.totalBudgets > 0 ? (metrics.approvedCount / metrics.totalBudgets) * 100 : 0)})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Pendentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{metrics.pendingCount}</span>
                  <span className="text-sm text-gray-500">
                    ({formatPercentage(metrics.totalBudgets > 0 ? (metrics.pendingCount / metrics.totalBudgets) * 100 : 0)})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Rejeitados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{metrics.rejectedCount}</span>
                  <span className="text-sm text-gray-500">
                    ({formatPercentage(metrics.totalBudgets > 0 ? (metrics.rejectedCount / metrics.totalBudgets) * 100 : 0)})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Performance */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Resumo de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Valor Médio por Orçamento</span>
                <span className="text-sm font-medium">{formatCurrency(metrics.averageValue)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Crescimento Mensal</span>
                <div className="flex items-center gap-1">
                  {getGrowthIcon(metrics.monthlyGrowth)}
                  <span className={`text-sm font-medium ${getGrowthColor(metrics.monthlyGrowth)}`}>
                    {formatPercentage(Math.abs(metrics.monthlyGrowth))}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Taxa de Aprovação</span>
                <span className="text-sm font-medium">{formatPercentage(metrics.conversionRate)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Total de Clientes</span>
                <span className="text-sm font-medium">
                  {budgets.filter((b, index, arr) => arr.findIndex(b2 => b2.clientName === b.clientName) === index).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-5 h-5 text-purple-600" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12"
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
            
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
            
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12"
            >
              <Users className="w-4 h-4 mr-2" />
              Análise de Clientes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 