'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Server, Database, Shield, Activity, Settings, AlertTriangle, CheckCircle, Key, Webhook, Code, Plus, Edit, Trash2, TestTube, RefreshCw, Loader2 } from 'lucide-react';
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

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: string;
  createdAt: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggered?: string;
  createdAt: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'ERP' | 'CRM' | 'HR' | 'ACCOUNTING' | 'CUSTOM';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  config: Record<string, any>;
  lastSync?: string;
  createdAt: string;
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

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'API Principal',
      key: 'sk_live_1234567890abcdef',
      permissions: ['read', 'write'],
      isActive: true,
      lastUsed: '2025-07-28T15:30:00Z',
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'API de Relatórios',
      key: 'sk_live_abcdef1234567890',
      permissions: ['read'],
      isActive: true,
      lastUsed: '2025-07-28T14:20:00Z',
      createdAt: '2025-02-20T09:00:00Z'
    }
  ]);

  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      name: 'Webhook de Funcionários',
      url: 'https://api.empresa.com/webhooks/employees',
      events: ['employee.created', 'employee.updated', 'employee.deleted'],
      isActive: true,
      lastTriggered: '2025-07-28T15:30:00Z',
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Webhook de Contratos',
      url: 'https://api.empresa.com/webhooks/contracts',
      events: ['contract.created', 'contract.updated'],
      isActive: true,
      lastTriggered: '2025-07-28T14:20:00Z',
      createdAt: '2025-02-20T09:00:00Z'
    }
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Sistema ERP',
      type: 'ERP',
      status: 'CONNECTED',
      config: { url: 'https://erp.empresa.com', apiKey: '***' },
      lastSync: '2025-07-28T15:30:00Z',
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Sistema de RH',
      type: 'HR',
      status: 'CONNECTED',
      config: { url: 'https://rh.empresa.com', apiKey: '***' },
      lastSync: '2025-07-28T14:20:00Z',
      createdAt: '2025-02-20T09:00:00Z'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isCreateApiKeyOpen, setIsCreateApiKeyOpen] = useState(false);
  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
  const [isCreateIntegrationOpen, setIsCreateIntegrationOpen] = useState(false);

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

  const getIntegrationStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return 'default';
      case 'DISCONNECTED':
        return 'secondary';
      case 'ERROR':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'ERP':
        return 'default';
      case 'CRM':
        return 'secondary';
      case 'HR':
        return 'outline';
      case 'ACCOUNTING':
        return 'destructive';
      case 'CUSTOM':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleCreateApiKey = async (apiKeyData: Partial<ApiKey>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        name: apiKeyData.name || '',
        key: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
        permissions: apiKeyData.permissions || [],
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setApiKeys(prev => [newApiKey, ...prev]);
      setIsCreateApiKeyOpen(false);
      toast.success('Chave API criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar chave API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWebhook = async (webhookData: Partial<Webhook>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newWebhook: Webhook = {
        id: Date.now().toString(),
        name: webhookData.name || '',
        url: webhookData.url || '',
        events: webhookData.events || [],
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setWebhooks(prev => [newWebhook, ...prev]);
      setIsCreateWebhookOpen(false);
      toast.success('Webhook criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar webhook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIntegration = async (integrationData: Partial<Integration>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newIntegration: Integration = {
        id: Date.now().toString(),
        name: integrationData.name || '',
        type: integrationData.type || 'CUSTOM',
        status: 'DISCONNECTED',
        config: integrationData.config || {},
        createdAt: new Date().toISOString()
      };

      setIntegrations(prev => [newIntegration, ...prev]);
      setIsCreateIntegrationOpen(false);
      toast.success('Integração criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar integração');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Webhook testado com sucesso!');
    } catch (error) {
      toast.error('Erro ao testar webhook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncIntegration = async (integrationId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Sincronização realizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao sincronizar integração');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="system" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="system" className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          Sistema
        </TabsTrigger>
        <TabsTrigger value="api" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          APIs
        </TabsTrigger>
        <TabsTrigger value="webhooks" className="flex items-center gap-2">
          <Webhook className="h-4 w-4" />
          Webhooks
        </TabsTrigger>
        <TabsTrigger value="integrations" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          Integrações
        </TabsTrigger>
      </TabsList>

      {/* Aba de Sistema */}
      <TabsContent value="system" className="space-y-6">
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
      </TabsContent>

      {/* Aba de APIs */}
      <TabsContent value="api" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Chaves de API
                </CardTitle>
                <CardDescription>
                  Gerencie as chaves de API do sistema
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateApiKeyOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Chave API
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map(apiKey => (
                <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{apiKey.name}</h3>
                      <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                        {apiKey.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      {apiKey.key.substring(0, 20)}...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Permissões: {apiKey.permissions.join(', ')}
                    </p>
                    {apiKey.lastUsed && (
                      <p className="text-xs text-muted-foreground">
                        Último uso: {new Date(apiKey.lastUsed).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba de Webhooks */}
      <TabsContent value="webhooks" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhooks
                </CardTitle>
                <CardDescription>
                  Configure webhooks para integração com sistemas externos
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateWebhookOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Webhook
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhooks.map(webhook => (
                <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{webhook.name}</h3>
                      <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                        {webhook.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{webhook.url}</p>
                    <p className="text-sm text-muted-foreground">
                      Eventos: {webhook.events.join(', ')}
                    </p>
                    {webhook.lastTriggered && (
                      <p className="text-xs text-muted-foreground">
                        Último disparo: {new Date(webhook.lastTriggered).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestWebhook(webhook.id)}
                      disabled={isLoading}
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba de Integrações */}
      <TabsContent value="integrations" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Integrações
                </CardTitle>
                <CardDescription>
                  Gerencie integrações com sistemas externos
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateIntegrationOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Integração
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map(integration => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{integration.name}</h3>
                      <Badge variant={getIntegrationStatusBadgeVariant(integration.status)}>
                        {integration.status === 'CONNECTED' ? 'Conectado' : 
                         integration.status === 'DISCONNECTED' ? 'Desconectado' : 'Erro'}
                      </Badge>
                      <Badge variant={getTypeBadgeVariant(integration.type)}>
                        {integration.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      URL: {integration.config.url}
                    </p>
                    {integration.lastSync && (
                      <p className="text-xs text-muted-foreground">
                        Última sincronização: {new Date(integration.lastSync).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSyncIntegration(integration.id)}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Modais de criação */}
      {isCreateApiKeyOpen && (
        <CreateApiKeyModal 
          onClose={() => setIsCreateApiKeyOpen(false)}
          onSubmit={handleCreateApiKey}
          isLoading={isLoading}
        />
      )}

      {isCreateWebhookOpen && (
        <CreateWebhookModal 
          onClose={() => setIsCreateWebhookOpen(false)}
          onSubmit={handleCreateWebhook}
          isLoading={isLoading}
        />
      )}

      {isCreateIntegrationOpen && (
        <CreateIntegrationModal 
          onClose={() => setIsCreateIntegrationOpen(false)}
          onSubmit={handleCreateIntegration}
          isLoading={isLoading}
        />
      )}
    </Tabs>
  );
}

// Componentes para modais de criação
function CreateApiKeyModal({ onClose, onSubmit, isLoading }: { 
  onClose: () => void, 
  onSubmit: (data: Partial<ApiKey>) => void, 
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Criar Nova Chave API</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Chave *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome da chave"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                'Criar Chave'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateWebhookModal({ onClose, onSubmit, isLoading }: { 
  onClose: () => void, 
  onSubmit: (data: Partial<Webhook>) => void, 
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Criar Novo Webhook</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Webhook *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome do webhook"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://api.exemplo.com/webhook"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                'Criar Webhook'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateIntegrationModal({ onClose, onSubmit, isLoading }: { 
  onClose: () => void, 
  onSubmit: (data: Partial<Integration>) => void, 
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'CUSTOM' as const,
    url: '',
    apiKey: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: formData.type,
      config: { url: formData.url, apiKey: formData.apiKey }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Criar Nova Integração</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Integração *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome da integração"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="ERP">ERP</option>
              <option value="CRM">CRM</option>
              <option value="HR">RH</option>
              <option value="ACCOUNTING">Contabilidade</option>
              <option value="CUSTOM">Personalizado</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL da API</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://api.exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave da API</Label>
            <Input
              id="apiKey"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Digite a chave da API"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                'Criar Integração'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 