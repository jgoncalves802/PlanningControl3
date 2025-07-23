'use client'

import { useEffect, useRef } from 'react'
import { useAppSettings } from '@/lib/contexts/AppSettingsContext'

export function useAutoRefresh(callback: () => void) {
  const { settings } = useAppSettings()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Limpar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Configurar novo intervalo se auto-refresh estiver habilitado
    if (settings.autoRefresh && settings.refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        callback()
      }, settings.refreshInterval * 1000)
    }

    // Cleanup ao desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [settings.autoRefresh, settings.refreshInterval, callback])

  return {
    isAutoRefreshEnabled: settings.autoRefresh,
    refreshInterval: settings.refreshInterval,
    stopAutoRefresh: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    },
    startAutoRefresh: () => {
      if (settings.autoRefresh && settings.refreshInterval > 0) {
        intervalRef.current = setInterval(() => {
          callback()
        }, settings.refreshInterval * 1000)
      }
    }
  }
} 