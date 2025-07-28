'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Server, Database, Shield, Activity, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SystemStatus {
  servers: {
    web: 'online' | 'offline' | 'warning';
    database: 'online' | 'offline' | 'warning';
    cache: 'online' | 'offline' | 'warning';
  };
  performance: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  uptime: string;
  lastBackup: string;
  activeUsers: number;
  totalRequests: number;
}

interface InfrastructureConfig {
  autoBackup: boolean;
  monitoringEnabled: boolean;
  alertThreshold: number;
  maintenanceMode: boolean;
  debugMode: boolean;
  logLevel: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
}

export default function InfrastructureSettings() {
  const [systemStatus] = useState<SystemStatus>({
    servers: {
      web: 'online',
      database: 'online',
      cache: 'warning'
    },
    performance: {
      cpu: 45,
      memory: 67,
      disk: 23,
      network: 12
    },
    uptime: '99.9%',
    lastBackup: '2025-07-28T02:00:00Z',
    activeUsers: 156,
    totalRequests: 15420
  });

  const [config, setConfig] = useState<InfrastructureConfig>({
    autoBackup: true,
    monitoringEnabled: true,
    alertThreshold: 80,
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'INFO'
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'online':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'offline':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value < 50) return 'text-green-500';
    if (value < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleConfigChange = (key: keyof InfrastructureConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    toast.success('Configuração atualizada');
  };

  const handleMaintenanceMode = () => {
    const newValue = !config.maintenanceMode;
    setConfig(prev => ({ ...prev, maintenanceMode: newValue }));
    toast.success(`Modo de manutenção ${newValue ? 'ativado' : 'desativado'}`);
  };

  const handleBackupNow = () => {
    toast.success('Backup iniciado. Você será notificado quando concluir.');
  };

  const handleRestartServices = () => {
    if (confirm('Tem certeza que deseja reiniciar os serviços? Isso pode causar interrupção temporária.')) {
      toast.success('Reinicialização dos serviços iniciada');
    }
  };

  return (
    <div className="space-y-6">
      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real da infraestrutura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Servidores */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Server className="h-4 w-4" />
                Servidores
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Web Server</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(systemStatus.servers.web)}
                    <Badge variant={getStatusBadgeVariant(systemStatus.servers.web)} size="sm">
                      {systemStatus.servers.web}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(systemStatus.servers.database)}
                    <Badge variant={getStatusBadgeVariant(systemStatus.servers.database)} size="sm">
                      {systemStatus.servers.database}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cache</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(systemStatus.servers.cache)}
                    <Badge variant={getStatusBadgeVariant(systemStatus.servers.cache)} size="sm">
                      {systemStatus.servers.cache}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Performance
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">CPU</span>
                  <span className={`text-sm font-medium ${getPerformanceColor(systemStatus.performance.cpu)}`}>
                    {systemStatus.performance.cpu}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memória</span>
                  <span className={`text-sm font-medium ${getPerformanceColor(systemStatus.performance.memory)}`}>
                    {systemStatus.performance.memory}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Disco</span>
                  <span className={`text-sm font-medium ${getPerformanceColor(systemStatus.performance.disk)}`}>
                    {systemStatus.performance.disk}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rede</span>
                  <span className={`text-sm font-medium ${getPerformanceColor(systemStatus.performance.network)}`}>
                    {systemStatus.performance.network}%
                  </span>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Estatísticas
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-sm font-medium text-green-500">{systemStatus.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Usuários Ativos</span>
                  <span className="text-sm font-medium">{systemStatus.activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Requisições Hoje</span>
                  <span className="text-sm font-medium">{systemStatus.totalRequests.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Último Backup</span>
                  <span className="text-sm font-medium">
                    {new Date(systemStatus.lastBackup).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Ações
              </h4>
              <div className="space-y-2">
                <Button size="sm" variant="outline" onClick={handleBackupNow} className="w-full">
                  Backup Agora
                </Button>
                <Button size="sm" variant="outline" onClick={handleRestartServices} className="w-full">
                  Reiniciar Serviços
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Infraestrutura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações de Infraestrutura
          </CardTitle>
          <CardDescription>
            Configure as opções de infraestrutura do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Configurações de Backup */}
            <div className="space-y-4">
              <h4 className="font-medium">Backup e Monitoramento</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup">Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Executar backup automático diário
                    </p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={config.autoBackup}
                    onCheckedChange={(checked) => handleConfigChange('autoBackup', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monitoringEnabled">Monitoramento Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Monitorar performance e alertas
                    </p>
                  </div>
                  <Switch
                    id="monitoringEnabled"
                    checked={config.monitoringEnabled}
                    onCheckedChange={(checked) => handleConfigChange('monitoringEnabled', checked)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="alertThreshold">Limite de Alerta (%)</Label>
                  <Input
                    id="alertThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={config.alertThreshold}
                    onChange={(e) => handleConfigChange('alertThreshold', parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>
            </div>

            {/* Configurações de Sistema */}
            <div className="space-y-4">
              <h4 className="font-medium">Sistema</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Bloquear acesso ao sistema para manutenção
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={config.maintenanceMode}
                    onCheckedChange={handleMaintenanceMode}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debugMode">Modo Debug</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar logs detalhados para desenvolvimento
                    </p>
                  </div>
                  <Switch
                    id="debugMode"
                    checked={config.debugMode}
                    onCheckedChange={(checked) => handleConfigChange('debugMode', checked)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logLevel">Nível de Log</Label>
                  <select
                    id="logLevel"
                    value={config.logLevel}
                    onChange={(e) => handleConfigChange('logLevel', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="ERROR">Erro</option>
                    <option value="WARN">Aviso</option>
                    <option value="INFO">Informação</option>
                    <option value="DEBUG">Debug</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 