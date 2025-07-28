'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Archive, 
  DollarSign,
  TrendingUp 
} from 'lucide-react';

interface BudgetStatsProps {
  budgets: any[];
}

export default function BudgetStats({ budgets }: BudgetStatsProps) {
  const stats = {
    total: budgets.length,
    draft: budgets.filter(b => b.status === 'DRAFT').length,
    inReview: budgets.filter(b => b.status === 'IN_REVIEW').length,
    approved: budgets.filter(b => b.status === 'APPROVED').length,
    rejected: budgets.filter(b => b.status === 'REJECTED').length,
    archived: budgets.filter(b => b.status === 'ARCHIVED').length,
    totalValue: budgets.reduce((sum, b) => sum + b.totalValue, 0),
    averageValue: budgets.length > 0 ? budgets.reduce((sum, b) => sum + b.totalValue, 0) / budgets.length : 0,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'ARCHIVED': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4" />;
      case 'IN_REVIEW': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      case 'ARCHIVED': return <Archive className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de Orçamentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Orçamentos cadastrados
          </p>
        </CardContent>
      </Card>

      {/* Valor Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Soma de todos os orçamentos
          </p>
        </CardContent>
      </Card>

      {/* Valor Médio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.averageValue)}</div>
          <p className="text-xs text-muted-foreground">
            Média por orçamento
          </p>
        </CardContent>
      </Card>

      {/* Aprovados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approved}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 ? `${((stats.approved / stats.total) * 100).toFixed(1)}%` : '0%'} do total
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 