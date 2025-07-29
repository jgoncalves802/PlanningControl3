'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Webhook, Database, Cloud, RefreshCw, Save, Loader2, Plus, Trash2, Edit, TestTube, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

interface BackupConfig {
  id: string;
  name: string;
  type: 'AUTOMATIC' | 'MANUAL';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  retention: number;
  isActive: boolean;
  lastBackup?: string;
  createdAt: string;
}

export default function IntegrationSettings() {
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

  const [backupConfigs, setBackupConfigs] = useState<BackupConfig[]>([
    {
      id: '1',
      name: 'Backup Diário',
      type: 'AUTOMATIC',
      frequency: 'DAILY',
      retention: 30,
      isActive: true,
      lastBackup: '2025-07-28T02:00:00Z',
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Backup Semanal',
      type: 'AUTOMATIC',
      frequency: 'WEEKLY',
      retention: 12,
      isActive: true,
      lastBackup: '2025-07-21T02:00:00Z',
      createdAt: '2025-01-15T10:00:00Z'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isCreateApiKeyOpen, setIsCreateApiKeyOpen] = useState(false);
  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
  const [isCreateIntegrationOpen, setIsCreateIntegrationOpen] = useState(false);
  const [isCreateBackupOpen, setIsCreateBackupOpen] = useState(false);

  const getStatusBadgeVariant = (status: string) => {
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

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
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

  const handleCreateBackup = async (backupData: Partial<BackupConfig>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBackup: BackupConfig = {
        id: Date.now().toString(),
        name: backupData.name || '',
        type: backupData.type || 'AUTOMATIC',
        frequency: backupData.frequency || 'DAILY',
        retention: backupData.retention || 30,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setBackupConfigs(prev => [newBackup, ...prev]);
      setIsCreateBackupOpen(false);
      toast.success('Configuração de backup criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar configuração de backup');
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
    <Tabs defaultValue="api" className="space-y-6">
      <TabsList>
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
        <TabsTrigger value="backup" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Backup
        </TabsTrigger>
      </TabsList>

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
                  Gerencie as chaves de API da empresa
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
                      <Badge variant={getStatusBadgeVariant(integration.status)}>
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

      {/* Aba de Backup */}
      <TabsContent value="backup" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Configurações de Backup
                </CardTitle>
                <CardDescription>
                  Configure backups automáticos e manuais
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateBackupOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Configuração
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {backupConfigs.map(backup => (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{backup.name}</h3>
                      <Badge variant={backup.isActive ? 'default' : 'secondary'}>
                        {backup.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Badge variant="outline">{backup.type}</Badge>
                      <Badge variant="outline">{backup.frequency}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Retenção: {backup.retention} {backup.frequency === 'DAILY' ? 'dias' : 
                       backup.frequency === 'WEEKLY' ? 'semanas' : 'meses'}
                    </p>
                    {backup.lastBackup && (
                      <p className="text-xs text-muted-foreground">
                        Último backup: {new Date(backup.lastBackup).toLocaleDateString('pt-BR')}
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

      {/* Botões de Ação */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">
          Cancelar
        </Button>
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>

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

      {isCreateBackupOpen && (
        <CreateBackupModal 
          onClose={() => setIsCreateBackupOpen(false)}
          onSubmit={handleCreateBackup}
          isLoading={isLoading}
        />
      )}
    </Tabs>
  );
}

// Componentes para modais de criação (simplificados)
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
            <Select
              value={formData.type}
              onValueChange={(value: 'ERP' | 'CRM' | 'HR' | 'ACCOUNTING' | 'CUSTOM') =>
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ERP">ERP</SelectItem>
                <SelectItem value="CRM">CRM</SelectItem>
                <SelectItem value="HR">RH</SelectItem>
                <SelectItem value="ACCOUNTING">Contabilidade</SelectItem>
                <SelectItem value="CUSTOM">Personalizado</SelectItem>
              </SelectContent>
            </Select>
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

function CreateBackupModal({ onClose, onSubmit, isLoading }: { 
  onClose: () => void, 
  onSubmit: (data: Partial<BackupConfig>) => void, 
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'AUTOMATIC' as const,
    frequency: 'DAILY' as const,
    retention: 30
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Criar Nova Configuração de Backup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Configuração *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome da configuração"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'AUTOMATIC' | 'MANUAL') =>
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUTOMATIC">Automático</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequência</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: 'DAILY' | 'WEEKLY' | 'MONTHLY') =>
                setFormData(prev => ({ ...prev, frequency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Diário</SelectItem>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
                <SelectItem value="MONTHLY">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="retention">Retenção (dias)</Label>
            <Input
              id="retention"
              type="number"
              min="1"
              value={formData.retention}
              onChange={(e) => setFormData(prev => ({ ...prev, retention: parseInt(e.target.value) }))}
              placeholder="30"
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
                'Criar Configuração'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 