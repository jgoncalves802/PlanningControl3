'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/providers/ThemeProvider'
import { useLanguage } from '@/lib/providers/LanguageProvider'
import toast from 'react-hot-toast'

interface PersonalSettings {
  name: string
  email: string
  phone: string
  timezone: string
  language: string
  theme: string
}

interface InterfaceSettings {
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

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  notificationTypes: {
    system: boolean
    security: boolean
    updates: boolean
    marketing: boolean
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface UserSettings {
  personal: PersonalSettings
  interface: InterfaceSettings
  notifications: NotificationSettings
}

const defaultSettings: UserSettings = {
  personal: {
    name: '',
    email: '',
    phone: '',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    theme: 'system'
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
    colorScheme: 'blue'
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationTypes: {
      system: true,
      security: true,
      updates: true,
      marketing: false
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  }
}

export function useSettings(userId: string = 'current') {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()

  // Carregar configurações
  const loadSettings = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/settings/user/${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        
        // Sincronizar com providers
        if (data.personal.theme) {
          setTheme(data.personal.theme as any)
        }
        if (data.personal.language) {
          setLanguage(data.personal.language as any)
        }
      } else if (response.status === 503) {
        // Aplicar configurações padrão localmente
        setSettings(defaultSettings)
        toast.success('Configurações padrão aplicadas')
      } else {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      
      // Aplicar configurações padrão em caso de erro
      setSettings(defaultSettings)
      toast.error('Erro ao carregar configurações. Usando padrões.')
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar configurações
  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const updatedSettings = { ...settings, ...newSettings }
      
      const response = await fetch(`/api/settings/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      })
      
      if (response.ok) {
        setSettings(updatedSettings)
        
        // Sincronizar com providers
        if (newSettings.personal?.theme) {
          setTheme(newSettings.personal.theme as any)
        }
        if (newSettings.personal?.language) {
          setLanguage(newSettings.personal.language as any)
        }
        
        toast.success('Configurações salvas com sucesso!')
        return true
      } else if (response.status === 503) {
        // Aplicar localmente em caso de erro de serviço
        setSettings(updatedSettings)
        toast.success('Configurações aplicadas localmente')
        return true
      } else {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      toast.error('Erro ao salvar configurações')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Atualizar configurações pessoais
  const updatePersonalSettings = async (personal: Partial<PersonalSettings>) => {
    return await saveSettings({ personal: { ...settings.personal, ...personal } })
  }

  // Atualizar configurações de interface
  const updateInterfaceSettings = async (interfaceSettings: Partial<InterfaceSettings>) => {
    return await saveSettings({ interface: { ...settings.interface, ...interfaceSettings } })
  }

  // Atualizar configurações de notificação
  const updateNotificationSettings = async (notifications: Partial<NotificationSettings>) => {
    return await saveSettings({ notifications: { ...settings.notifications, ...notifications } })
  }

  // Resetar para configurações padrão
  const resetToDefault = async () => {
    return await saveSettings(defaultSettings)
  }

  // Carregar configurações na inicialização
  useEffect(() => {
    loadSettings()
  }, [userId])

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    saveSettings,
    updatePersonalSettings,
    updateInterfaceSettings,
    updateNotificationSettings,
    resetToDefault,
    theme,
    setTheme,
    language,
    setLanguage
  }
} 