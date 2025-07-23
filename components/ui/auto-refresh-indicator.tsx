'use client'

import { useEffect, useState } from 'react'
import { useAppSettings } from '@/lib/contexts/AppSettingsContext'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutoRefreshIndicatorProps {
  className?: string
}

export function AutoRefreshIndicator({ className }: AutoRefreshIndicatorProps) {
  const { settings } = useAppSettings()
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(settings.refreshInterval)

  useEffect(() => {
    if (!settings.autoRefresh) {
      setTimeUntilRefresh(0)
      return
    }

    const interval = setInterval(() => {
      setTimeUntilRefresh((prev) => {
        if (prev <= 1) {
          return settings.refreshInterval
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [settings.autoRefresh, settings.refreshInterval])

  if (!settings.autoRefresh) {
    return null
  }

  return (
    <div className={cn(
      "flex items-center gap-2 text-xs text-muted-foreground",
      className
    )}>
      <RefreshCw className="h-3 w-3 animate-spin" />
      <span>
        Atualiza em {timeUntilRefresh}s
      </span>
    </div>
  )
} 