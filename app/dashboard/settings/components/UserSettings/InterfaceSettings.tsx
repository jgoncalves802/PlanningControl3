'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout, Save, Loader2, RefreshCw } from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { useLanguage } from '@/lib/providers/LanguageProvider';
import { useAppSettings } from '@/lib/contexts/AppSettingsContext';

export default function InterfaceSettings() {
  const { settings, updateInterfaceSettings, isLoading, resetToDefault } = useSettings();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { settings: appSettings, updateSettings } = useAppSettings();
  
  const [localSettings, setLocalSettings] = useState(settings.interface);

  // Sincronizar com configurações carregadas
  useEffect(() => {
    setLocalSettings(settings.interface);
  }, [settings.interface]);

  const handleToggle = (field: keyof typeof localSettings) => {
    const newSettings = { ...localSettings, [field]: !localSettings[field] };
    setLocalSettings(newSettings);
    
    // Aplicar mudança imediatamente
    updateSettings({ [field]: !localSettings[field] });
  };

  const handleSelectChange = (field: keyof typeof localSettings, value: string | number) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    
    // Aplicar mudança imediatamente
    updateSettings({ [field]: value });
  };

  const handleSave = async () => {
    const success = await updateInterfaceSettings(localSettings);
    if (success) {
      // As mudanças já foram aplicadas em tempo real
      console.log('Configurações salvas e aplicadas com sucesso!');
    }
  };

  const handleReset = async () => {
    await resetToDefault();
    // As configurações padrão serão aplicadas automaticamente via useEffect
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
    setLocalSettings(prev => ({ ...prev, colorScheme: newTheme }));
    updateSettings({ colorScheme: newTheme });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
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
                value={localSettings.dashboardLayout} 
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
                value={localSettings.colorScheme} 
                onValueChange={handleThemeChange}
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
                checked={localSettings.sidebarCollapsed}
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
                checked={localSettings.showNotifications}
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
                checked={localSettings.showQuickActions}
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
                checked={localSettings.compactMode}
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
                checked={localSettings.showAnimations}
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
                checked={localSettings.autoRefresh}
                onCheckedChange={() => handleToggle('autoRefresh')}
              />
            </div>
            {localSettings.autoRefresh && (
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Intervalo de atualização (segundos)</Label>
                <Select 
                  value={localSettings.refreshInterval.toString()} 
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

        {/* Tema e Idioma */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Aparência</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select 
                value={theme} 
                onValueChange={handleThemeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select 
                value={language} 
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
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