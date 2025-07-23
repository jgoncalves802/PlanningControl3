"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AppSettings {
  dashboardLayout: string
  sidebarCollapsed: boolean
  showNotifications: boolean
  showQuickActions: boolean
  autoRefresh: boolean
  refreshInterval: number
  compactMode: boolean
  showAnimations: boolean
  colorScheme: string
}

interface AppSettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  applySettings: () => void
}

const defaultSettings: AppSettings = {
  dashboardLayout: 'grid',
  sidebarCollapsed: false,
  showNotifications: true,
  showQuickActions: true,
  autoRefresh: true,
  refreshInterval: 30,
  compactMode: false,
  showAnimations: true,
  colorScheme: 'blue'
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined)

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('app-settings')
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsedSettings })
        applySettingsToDOM({ ...defaultSettings, ...parsedSettings })
      } else {
        applySettingsToDOM(defaultSettings)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      applySettingsToDOM(defaultSettings)
    }
  }, [])

  // Aplicar configurações ao DOM
  const applySettingsToDOM = (appSettings: AppSettings) => {
    if (typeof document === 'undefined') return

    const root = document.documentElement

    // Aplicar modo compacto
    if (appSettings.compactMode) {
      root.classList.add('compact-mode')
    } else {
      root.classList.remove('compact-mode')
    }

    // Aplicar animações
    if (appSettings.showAnimations) {
      root.classList.add('animations-enabled')
    } else {
      root.classList.remove('animations-enabled')
    }

    // Aplicar esquema de cores
    root.classList.remove('color-scheme-blue', 'color-scheme-green', 'color-scheme-purple', 'color-scheme-orange')
    root.classList.add(`color-scheme-${appSettings.colorScheme}`)

    // Aplicar layout do dashboard
    root.setAttribute('data-dashboard-layout', appSettings.dashboardLayout)

    // Aplicar configurações de notificações
    root.setAttribute('data-show-notifications', appSettings.showNotifications.toString())
    root.setAttribute('data-show-quick-actions', appSettings.showQuickActions.toString())

    // Aplicar configurações de sidebar
    root.setAttribute('data-sidebar-collapsed', appSettings.sidebarCollapsed.toString())

    // Aplicar configurações de atualização automática
    root.setAttribute('data-auto-refresh', appSettings.autoRefresh.toString())
    root.setAttribute('data-refresh-interval', appSettings.refreshInterval.toString())
  }

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    
    // Salvar no localStorage
    try {
      localStorage.setItem('app-settings', JSON.stringify(updatedSettings))
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
    }
    
    applySettingsToDOM(updatedSettings)
  }

  const applySettings = () => {
    applySettingsToDOM(settings)
  }

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, applySettings }}>
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext)
  if (context === undefined) {
    throw new Error('useAppSettings deve ser usado dentro de um AppSettingsProvider')
  }
  return context
} 