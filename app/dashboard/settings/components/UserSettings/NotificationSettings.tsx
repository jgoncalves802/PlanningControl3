'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, Smartphone, Save, Loader2, TestTube } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationSettingsData {
  // Notificações Push
  pushEnabled: boolean;
  pushWorkHours: boolean;
  pushAfterHours: boolean;
  
  // Notificações por Email
  emailEnabled: boolean;
  emailDaily: boolean;
  emailWeekly: boolean;
  emailUrgent: boolean;
  
  // Tipos de Notificação
  newAssignments: boolean;
  scheduleChanges: boolean;
  systemUpdates: boolean;
  reminders: boolean;
  alerts: boolean;
  
  // Horários
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
  timezone: string;
}

export default function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<NotificationSettingsData>({
    pushEnabled: true,
    pushWorkHours: true,
    pushAfterHours: false,
    emailEnabled: true,
    emailDaily: false,
    emailWeekly: true,
    emailUrgent: true,
    newAssignments: true,
    scheduleChanges: true,
    systemUpdates: false,
    reminders: true,
    alerts: true,
    quietHours: true,
    quietStart: '22:00',
    quietEnd: '07:00',
    timezone: 'America/Sao_Paulo'
  });

  const handleToggle = (field: keyof NotificationSettingsData) => {
    setData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSelectChange = (field: keyof NotificationSettingsData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configurações de notificações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      // Simular envio de notificação de teste
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Notificação de teste enviada!');
    } catch (error) {
      toast.error('Erro ao enviar notificação de teste');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configurações de Notificações
        </CardTitle>
        <CardDescription>
          Gerencie como e quando você recebe notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notificações Push */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Notificações Push
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações push</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações no navegador
                </p>
              </div>
              <Switch
                checked={data.pushEnabled}
                onCheckedChange={() => handleToggle('pushEnabled')}
              />
            </div>
            {data.pushEnabled && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Durante horário de trabalho</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações durante o expediente
                    </p>
                  </div>
                  <Switch
                    checked={data.pushWorkHours}
                    onCheckedChange={() => handleToggle('pushWorkHours')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Fora do horário de trabalho</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações após o expediente
                    </p>
                  </div>
                  <Switch
                    checked={data.pushAfterHours}
                    onCheckedChange={() => handleToggle('pushAfterHours')}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notificações por Email */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Notificações por Email
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por email</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações por email
                </p>
              </div>
              <Switch
                checked={data.emailEnabled}
                onCheckedChange={() => handleToggle('emailEnabled')}
              />
            </div>
            {data.emailEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resumo diário</Label>
                  </div>
                  <Switch
                    checked={data.emailDaily}
                    onCheckedChange={() => handleToggle('emailDaily')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resumo semanal</Label>
                  </div>
                  <Switch
                    checked={data.emailWeekly}
                    onCheckedChange={() => handleToggle('emailWeekly')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Urgências</Label>
                  </div>
                  <Switch
                    checked={data.emailUrgent}
                    onCheckedChange={() => handleToggle('emailUrgent')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tipos de Notificação */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tipos de Notificação</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Novas atribuições</Label>
                <p className="text-sm text-muted-foreground">
                  Quando você receber novas tarefas
                </p>
              </div>
              <Switch
                checked={data.newAssignments}
                onCheckedChange={() => handleToggle('newAssignments')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mudanças de agenda</Label>
                <p className="text-sm text-muted-foreground">
                  Alterações no seu cronograma
                </p>
              </div>
              <Switch
                checked={data.scheduleChanges}
                onCheckedChange={() => handleToggle('scheduleChanges')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Atualizações do sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Novidades e melhorias do sistema
                </p>
              </div>
              <Switch
                checked={data.systemUpdates}
                onCheckedChange={() => handleToggle('systemUpdates')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembretes</Label>
                <p className="text-sm text-muted-foreground">
                  Lembretes de tarefas e prazos
                </p>
              </div>
              <Switch
                checked={data.reminders}
                onCheckedChange={() => handleToggle('reminders')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas importantes e emergências
                </p>
              </div>
              <Switch
                checked={data.alerts}
                onCheckedChange={() => handleToggle('alerts')}
              />
            </div>
          </div>
        </div>

        {/* Horário Silencioso */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Horário Silencioso</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ativar horário silencioso</Label>
                <p className="text-sm text-muted-foreground">
                  Pausar notificações em horários específicos
                </p>
              </div>
              <Switch
                checked={data.quietHours}
                onCheckedChange={() => handleToggle('quietHours')}
              />
            </div>
            {data.quietHours && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <input
                    type="time"
                    value={data.quietStart}
                    onChange={(e) => handleSelectChange('quietStart', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <input
                    type="time"
                    value={data.quietEnd}
                    onChange={(e) => handleSelectChange('quietEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select 
                    value={data.timezone} 
                    onValueChange={(value) => handleSelectChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                      <SelectItem value="America/Belem">Belém (UTC-3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleTestNotification}>
            <TestTube className="h-4 w-4 mr-2" />
            Testar Notificação
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 