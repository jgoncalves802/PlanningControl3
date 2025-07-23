import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface PersonalSettings {
  name: string;
  email: string;
  phone: string;
  language: string;
  timezone: string;
  theme: string;
  avatar?: string;
}

interface InterfaceSettings {
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

interface NotificationSettings {
  pushEnabled: boolean;
  pushWorkHours: boolean;
  pushAfterHours: boolean;
  emailEnabled: boolean;
  emailDaily: boolean;
  emailWeekly: boolean;
  emailUrgent: boolean;
  newAssignments: boolean;
  scheduleChanges: boolean;
  systemUpdates: boolean;
  reminders: boolean;
  alerts: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
}

interface UserSettings {
  personal: PersonalSettings;
  interface: InterfaceSettings;
  notifications: NotificationSettings;
}

export function useSettings(userId: string = 'current') {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/settings/user/${userId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar configurações');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err: any) {
      console.error('Erro ao buscar configurações:', err);
      setError(err.message || 'Erro desconhecido');
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const saveSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      setIsSaving(true);
      setError(null);

      const updatedSettings = {
        ...settings,
        ...newSettings,
      };

      const response = await fetch(`/api/settings/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações');
      }

      const data = await response.json();
      setSettings(updatedSettings as UserSettings);
      toast.success('Configurações salvas com sucesso!');
      
      return data;
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      setError(err.message || 'Erro desconhecido');
      toast.error('Erro ao salvar configurações');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [settings, userId]);

  const updatePersonalSettings = useCallback(async (personal: Partial<PersonalSettings>) => {
    return saveSettings({ personal: { ...settings?.personal, ...personal } as PersonalSettings });
  }, [saveSettings, settings?.personal]);

  const updateInterfaceSettings = useCallback(async (interfaceSettings: Partial<InterfaceSettings>) => {
    return saveSettings({ interface: { ...settings?.interface, ...interfaceSettings } as InterfaceSettings });
  }, [saveSettings, settings?.interface]);

  const updateNotificationSettings = useCallback(async (notifications: Partial<NotificationSettings>) => {
    return saveSettings({ notifications: { ...settings?.notifications, ...notifications } as NotificationSettings });
  }, [saveSettings, settings?.notifications]);

  const resetSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Resetar para configurações padrão
      const defaultSettings = {
        personal: {
          name: '',
          email: '',
          phone: '',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          theme: 'system',
          avatar: undefined,
        },
        interface: {
          dashboardLayout: 'grid',
          sidebarCollapsed: false,
          showNotifications: true,
          showQuickActions: true,
          autoRefresh: true,
          refreshInterval: 30,
          compactMode: false,
          showAnimations: true,
          colorScheme: 'blue',
        },
        notifications: {
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
        },
      };

      await saveSettings(defaultSettings);
      toast.success('Configurações resetadas para o padrão!');
    } catch (error) {
      toast.error('Erro ao resetar configurações');
    } finally {
      setIsSaving(false);
    }
  }, [saveSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    isSaving,
    fetchSettings,
    saveSettings,
    updatePersonalSettings,
    updateInterfaceSettings,
    updateNotificationSettings,
    resetSettings,
  };
} 