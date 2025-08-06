'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout, Save, Loader2, RefreshCw } from 'lucide-react';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { useLanguage } from '@/lib/providers/LanguageProvider';
import { useAppSettings } from '@/lib/contexts/AppSettingsContext';

// Configurações padrão de interface
const defaultInterfaceSettings = {
  dashboardLayout: 'grid',
  colorScheme: 'system',
  sidebarCollapsed: false,
  showNotifications: true,
  autoRefresh: true,
  compactMode: false,
  animations: true,
  soundEffects: false
};

export default function InterfaceSettings() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { settings: appSettings, updateSettings } = useAppSettings();
  
  const [localSettings, setLocalSettings] = useState(defaultInterfaceSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar com configurações carregadas
  useEffect(() => {
    if (appSettings?.interface) {
      setLocalSettings(appSettings.interface);
    }
  }, [appSettings?.interface]);

  const handleToggle = (field: keyof typeof localSettings) => {
    const newSettings = { ...localSettings, [field]: !localSettings[field] };
    setLocalSettings(newSettings);
    
    // Aplicar mudança imediatamente
    updateSettings({ interface: { [field]: !localSettings[field] } });
  };

  const handleSelectChange = (field: keyof typeof localSettings, value: string | number) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    
    // Aplicar mudança imediatamente
    updateSettings({ interface: { [field]: value } });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Configurações salvas e aplicadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      // Simular reset
      await new Promise(resolve => setTimeout(resolve, 500));
      setLocalSettings(defaultInterfaceSettings);
      updateSettings({ interface: defaultInterfaceSettings });
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
    setLocalSettings(prev => ({ ...prev, colorScheme: newTheme }));
    updateSettings({ interface: { colorScheme: newTheme } });
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
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
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
                <Label>Sidebar Recolhida</Label>
                <p className="text-sm text-muted-foreground">
                  Iniciar com a sidebar recolhida
                </p>
              </div>
              <Switch
                checked={localSettings.sidebarCollapsed}
                onCheckedChange={() => handleToggle('sidebarCollapsed')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar Notificações</Label>
                <p className="text-sm text-muted-foreground">
                  Exibir notificações em tempo real
                </p>
              </div>
              <Switch
                checked={localSettings.showNotifications}
                onCheckedChange={() => handleToggle('showNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Atualização Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Atualizar dados automaticamente
                </p>
              </div>
              <Switch
                checked={localSettings.autoRefresh}
                onCheckedChange={() => handleToggle('autoRefresh')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Compacto</Label>
                <p className="text-sm text-muted-foreground">
                  Reduzir espaçamentos e tamanhos
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
                  Habilitar animações de transição
                </p>
              </div>
              <Switch
                checked={localSettings.animations}
                onCheckedChange={() => handleToggle('animations')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Efeitos Sonoros</Label>
                <p className="text-sm text-muted-foreground">
                  Reproduzir sons de notificação
                </p>
              </div>
              <Switch
                checked={localSettings.soundEffects}
                onCheckedChange={() => handleToggle('soundEffects')}
              />
            </div>
          </div>
        </div>

        {/* Idioma */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Idioma</h3>
          <div className="space-y-2">
            <Label htmlFor="language">Idioma da Interface</Label>
            <Select 
              value={language} 
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Configurações
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 