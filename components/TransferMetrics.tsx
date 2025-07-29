import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface TransferMetricsProps {
  transfer: any;
}

export function TransferMetrics({ transfer }: TransferMetricsProps) {
  const calculateTimeDiff = (startDate: string, endDate?: string) => {
    if (!endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    }
    return `${diffMinutes}min`;
  };

  const getProcessTime = (transfer: any) => {
    return {
      approval: calculateTimeDiff(transfer.requestedAt, transfer.approvedAt),
      transfer: calculateTimeDiff(transfer.approvedAt || transfer.requestedAt, transfer.transferredAt),
      finalization: calculateTimeDiff(transfer.transferredAt || transfer.approvedAt || transfer.requestedAt, transfer.finalizedAt),
      total: calculateTimeDiff(transfer.requestedAt, transfer.finalizedAt)
    };
  };

  const times = getProcessTime(transfer);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Aprovação</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {times.approval || 'Pendente'}
          </div>
          <p className="text-xs text-muted-foreground">
            Solicitação → Aprovação
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Transferência</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {times.transfer || 'Pendente'}
          </div>
          <p className="text-xs text-muted-foreground">
            Aprovação → Transferência
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Finalização</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {times.finalization || 'Pendente'}
          </div>
          <p className="text-xs text-muted-foreground">
            Transferência → Finalização
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {times.total || 'Em andamento'}
          </div>
          <p className="text-xs text-muted-foreground">
            Solicitação → Finalização
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 