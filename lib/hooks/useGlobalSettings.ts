import { useEffect, useCallback } from 'react';
import { useSettings } from './useSettings';

export function useGlobalSettings() {
  const { settings, saveSettings } = useSettings('current');

  // Aplicar configurações globais quando mudarem
  useEffect(() => {
    if (settings?.personal) {
      applyGlobalSettings(settings.personal);
    }
  }, [settings?.personal]);

  const applyGlobalSettings = useCallback((personalSettings: any) => {
    // Aplicar tema
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (personalSettings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(personalSettings.theme);
    }
    
    // Aplicar idioma
    document.documentElement.lang = personalSettings.language;
    localStorage.setItem('app-language', personalSettings.language);
    localStorage.setItem('theme', personalSettings.theme);
    
    // Disparar eventos para notificar outros componentes
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: personalSettings.theme } 
    }));
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: personalSettings.language } 
    }));
  }, []);

  const updateGlobalSettings = useCallback(async (newSettings: any) => {
    try {
      await saveSettings({ personal: newSettings });
      applyGlobalSettings(newSettings);
    } catch (error) {
      console.error('Erro ao atualizar configurações globais:', error);
    }
  }, [saveSettings, applyGlobalSettings]);

  return {
    settings,
    updateGlobalSettings,
    applyGlobalSettings,
  };
} 