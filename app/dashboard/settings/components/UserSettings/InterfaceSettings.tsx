'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout, Save, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface InterfaceSettingsData {
  dashboardLayout: string;
  sidebarCollapsed: boolean;
  showNotifications: boolean;
  showQuickActions: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  compactMode: boolean;
  showAnimations: boolean;
  colorScheme: string;
}

export default function InterfaceSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<InterfaceSettingsData>({
    dashboardLayout: 'grid',
    sidebarCollapsed: false,
    showNotifications: true,
    showQuickActions: true,
    autoRefresh: true,
    refreshInterval: 30,
    compactMode: false,
    showAnimations: true,
    colorScheme: 'blue'
  });

  const handleToggle = (field: keyof InterfaceSettingsData) => {
    setData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSelectChange = (field: keyof InterfaceSettingsData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configurações de interface salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setData({
      dashboardLayout: 'grid',
      sidebarCollapsed: false,
      showNotifications: true,
      showQuickActions: true,
      autoRefresh: true,
      refreshInterval: 30,
      compactMode: false,
      showAnimations: true,
      colorScheme: 'blue'
    });
    toast.success('Configurações resetadas para o padrão!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Configurações de Interface
        </CardTitle>
        <CardDescription>
          Personalize a aparência e comportamento da interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Layout do Dashboard */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Layout</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-layout">Layout do Dashboard</Label>
              <Select 
                value={data.dashboardLayout} 
                onValueChange={(value) => handleSelectChange('dashboardLayout', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grade</SelectItem>
                  <SelectItem value="list">Lista</SelectItem>
                  <SelectItem value="compact">Compacto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color-scheme">Esquema de Cores</Label>
              <Select 
                value={data.colorScheme} 
                onValueChange={(value) => handleSelectChange('colorScheme', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o esquema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Azul</SelectItem>
                  <SelectItem value="green">Verde</SelectItem>
                  <SelectItem value="purple">Roxo</SelectItem>
                  <SelectItem value="orange">Laranja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Comportamento */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Comportamento</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Barra lateral recolhida</Label>
                <p className="text-sm text-muted-foreground">
                  Iniciar com a barra lateral minimizada
                </p>
              </div>
              <Switch
                checked={data.sidebarCollapsed}
                onCheckedChange={() => handleToggle('sidebarCollapsed')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar notificações</Label>
                <p className="text-sm text-muted-foreground">
                  Exibir notificações na interface
                </p>
              </div>
              <Switch
                checked={data.showNotifications}
                onCheckedChange={() => handleToggle('showNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ações rápidas</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar botões de ações rápidas
                </p>
              </div>
              <Switch
                checked={data.showQuickActions}
                onCheckedChange={() => handleToggle('showQuickActions')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo compacto</Label>
                <p className="text-sm text-muted-foreground">
                  Reduzir espaçamentos da interface
                </p>
              </div>
              <Switch
                checked={data.compactMode}
                onCheckedChange={() => handleToggle('compactMode')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Animações</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar animações e transições
                </p>
              </div>
              <Switch
                checked={data.showAnimations}
                onCheckedChange={() => handleToggle('showAnimations')}
              />
            </div>
          </div>
        </div>

        {/* Atualização Automática */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Atualização Automática</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Atualização automática</Label>
                <p className="text-sm text-muted-foreground">
                  Atualizar dados automaticamente
                </p>
              </div>
              <Switch
                checked={data.autoRefresh}
                onCheckedChange={() => handleToggle('autoRefresh')}
              />
            </div>
            {data.autoRefresh && (
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Intervalo de atualização (segundos)</Label>
                <Select 
                  value={data.refreshInterval.toString()} 
                  onValueChange={(value) => handleSelectChange('refreshInterval', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o intervalo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 segundos</SelectItem>
                    <SelectItem value="30">30 segundos</SelectItem>
                    <SelectItem value="60">1 minuto</SelectItem>
                    <SelectItem value="300">5 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
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