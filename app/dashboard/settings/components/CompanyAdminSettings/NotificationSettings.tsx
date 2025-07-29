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
import { Bell, Mail, MessageSquare, AlertTriangle, Clock, Save, Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'WELCOME' | 'REMINDER' | 'ALERT' | 'REPORT';
  isActive: boolean;
  createdAt: string;
}

interface NotificationRule {
  id: string;
  name: string;
  type: 'EMAIL' | 'PUSH' | 'SMS';
  trigger: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'EVENT';
  isActive: boolean;
  recipients: string[];
  createdAt: string;
}

interface Alert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  isActive: boolean;
  actions: string[];
  createdAt: string;
}

export default function NotificationSettings() {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Boas-vindas',
      subject: 'Bem-vindo à {empresa}',
      body: 'Olá {nome},\n\nBem-vindo à {empresa}! Estamos felizes em tê-lo conosco.\n\nAtenciosamente,\nEquipe {empresa}',
      type: 'WELCOME',
      isActive: true,
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Lembrete de Relatório',
      subject: 'Lembrete: Relatório Semanal',
      body: 'Olá {nome},\n\nEste é um lembrete para enviar o relatório semanal até sexta-feira.\n\nAtenciosamente,\nEquipe {empresa}',
      type: 'REMINDER',
      isActive: true,
      createdAt: '2025-01-20T11:00:00Z'
    }
  ]);

  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'Relatório Diário',
      type: 'EMAIL',
      trigger: 'DAILY',
      isActive: true,
      recipients: ['gerentes@empresa.com'],
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Lembrete Semanal',
      type: 'PUSH',
      trigger: 'WEEKLY',
      isActive: true,
      recipients: ['todos'],
      createdAt: '2025-01-20T11:00:00Z'
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'Alerta de Overtime',
      condition: 'Horas trabalhadas > 44h/semana',
      threshold: 44,
      isActive: true,
      actions: ['email_gerente', 'notificacao_funcionario'],
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Alerta de Ausência',
      condition: 'Ausência não justificada > 3 dias',
      threshold: 3,
      isActive: true,
      actions: ['email_rh', 'notificacao_funcionario'],
      createdAt: '2025-01-20T11:00:00Z'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false);

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

  const handleCreateTemplate = async (templateData: Partial<EmailTemplate>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        name: templateData.name || '',
        subject: templateData.subject || '',
        body: templateData.body || '',
        type: templateData.type || 'WELCOME',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setEmailTemplates(prev => [newTemplate, ...prev]);
      setIsCreateTemplateOpen(false);
      toast.success('Template criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = async (ruleData: Partial<NotificationRule>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRule: NotificationRule = {
        id: Date.now().toString(),
        name: ruleData.name || '',
        type: ruleData.type || 'EMAIL',
        trigger: ruleData.trigger || 'DAILY',
        isActive: true,
        recipients: ruleData.recipients || [],
        createdAt: new Date().toISOString()
      };

      setNotificationRules(prev => [newRule, ...prev]);
      setIsCreateRuleOpen(false);
      toast.success('Regra criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar regra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlert = async (alertData: Partial<Alert>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAlert: Alert = {
        id: Date.now().toString(),
        name: alertData.name || '',
        condition: alertData.condition || '',
        threshold: alertData.threshold || 0,
        isActive: true,
        actions: alertData.actions || [],
        createdAt: new Date().toISOString()
      };

      setAlerts(prev => [newAlert, ...prev]);
      setIsCreateAlertOpen(false);
      toast.success('Alerta criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar alerta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações Gerais de Notificações
          </CardTitle>
          <CardDescription>
            Configure as notificações gerais da empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Notificações por Email</Label>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <span className="text-sm text-muted-foreground">Ativar notificações por email</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notificações Push</Label>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <span className="text-sm text-muted-foreground">Ativar notificações push</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notificações SMS</Label>
              <div className="flex items-center space-x-2">
                <Switch />
                <span className="text-sm text-muted-foreground">Ativar notificações SMS</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notificações em Tempo Real</Label>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <span className="text-sm text-muted-foreground">Ativar notificações em tempo real</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates de Email */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Templates de Email
              </CardTitle>
              <CardDescription>
                Gerencie os templates de email da empresa
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateTemplateOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emailTemplates.map(template => (
              <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    Criado em: {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                  </p>
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

      {/* Regras de Notificação */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Regras de Notificação
              </CardTitle>
              <CardDescription>
                Configure regras automáticas de notificação
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateRuleOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Regra
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationRules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{rule.name}</h3>
                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                      {rule.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">{rule.type}</Badge>
                    <Badge variant="outline">{rule.trigger}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Destinatários: {rule.recipients.join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Criado em: {new Date(rule.createdAt).toLocaleDateString('pt-BR')}
                  </p>
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

      {/* Alertas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas e Monitoramento
              </CardTitle>
              <CardDescription>
                Configure alertas automáticos para situações específicas
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateAlertOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Alerta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{alert.name}</h3>
                    <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                      {alert.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.condition}</p>
                  <p className="text-sm text-muted-foreground">
                    Ações: {alert.actions.join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Criado em: {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                  </p>
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

      {/* Modal para criar template */}
      {isCreateTemplateOpen && (
        <CreateTemplateModal 
          onClose={() => setIsCreateTemplateOpen(false)}
          onSubmit={handleCreateTemplate}
          isLoading={isLoading}
        />
      )}

      {/* Modal para criar regra */}
      {isCreateRuleOpen && (
        <CreateRuleModal 
          onClose={() => setIsCreateRuleOpen(false)}
          onSubmit={handleCreateRule}
          isLoading={isLoading}
        />
      )}

      {/* Modal para criar alerta */}
      {isCreateAlertOpen && (
        <CreateAlertModal 
          onClose={() => setIsCreateAlertOpen(false)}
          onSubmit={handleCreateAlert}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// Componente para modal de criação de template
function CreateTemplateModal({ onClose, onSubmit, isLoading }: { 
  onClose: () => void, 
  onSubmit: (data: Partial<EmailTemplate>) => void, 
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'WELCOME' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Criar Novo Template</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Template *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome do template"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Template</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'WELCOME' | 'REMINDER' | 'ALERT' | 'REPORT') =>
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WELCOME">Boas-vindas</SelectItem>
                <SelectItem value="REMINDER">Lembrete</SelectItem>
                <SelectItem value="ALERT">Alerta</SelectItem>
                <SelectItem value="REPORT">Relatório</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Digite o assunto do email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Corpo do Email *</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Digite o conteúdo do email"
              rows={8}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use {'{nome}'}, {'{empresa}'} para variáveis dinâmicas
            </p>
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
                'Criar Template'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente para modal de criação de regra
function CreateRuleModal({ onClose, onSubmit, isLoading }: { 
  onClose: () => void, 
  onSubmit: (data: Partial<NotificationRule>) => void, 
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'EMAIL' as const,
    trigger: 'DAILY' as const,
    recipients: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      recipients: formData.recipients.split(',').map(r => r.trim())
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Criar Nova Regra</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Regra *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome da regra"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Notificação</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'EMAIL' | 'PUSH' | 'SMS') =>
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="PUSH">Push</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="trigger">Gatilho</Label>
            <Select
              value={formData.trigger}
              onValueChange={(value: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'EVENT') =>
                setFormData(prev => ({ ...prev, trigger: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o gatilho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Diário</SelectItem>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
                <SelectItem value="MONTHLY">Mensal</SelectItem>
                <SelectItem value="EVENT">Por evento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipients">Destinatários</Label>
            <Input
              id="recipients"
              value={formData.recipients}
              onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
              placeholder="email1@empresa.com, email2@empresa.com"
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
                'Criar Regra'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente para modal de criação de alerta
function CreateAlertModal({ onClose, onSubmit, isLoading }: { 
  onClose: () => void, 
  onSubmit: (data: Partial<Alert>) => void, 
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    name: '',
    condition: '',
    threshold: 0,
    actions: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      actions: formData.actions.split(',').map(a => a.trim())
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Criar Novo Alerta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Alerta *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome do alerta"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">Condição *</Label>
            <Input
              id="condition"
              value={formData.condition}
              onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
              placeholder="Ex: Horas trabalhadas > 44h/semana"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">Limite</Label>
            <Input
              id="threshold"
              type="number"
              value={formData.threshold}
              onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="actions">Ações</Label>
            <Input
              id="actions"
              value={formData.actions}
              onChange={(e) => setFormData(prev => ({ ...prev, actions: e.target.value }))}
              placeholder="email_gerente, notificacao_funcionario"
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
                'Criar Alerta'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 