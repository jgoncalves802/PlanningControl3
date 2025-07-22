'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Zap, Wifi, WifiOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface NFCReaderProps {
  onRead: (data: string) => void
  onStatusChange: (status: string) => void
  isActive: boolean
}

export function NFCReader({ onRead, onStatusChange, isActive }: NFCReaderProps) {
  const [status, setStatus] = useState('idle')
  const [isNFCSupported, setIsNFCSupported] = useState(false)
  const [simulationMode, setSimulationMode] = useState(false)

  // Dados NFC reais dos funcionários (em produção, vir do banco de dados)
  const validNFCCards = [
    'NFC001', 'NFC002', 'NFC003', 'NFC004', 'NFC005'
  ]

  useEffect(() => {
    // Verificar se NFC é suportado no dispositivo
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setIsNFCSupported(true)
      setSimulationMode(false)
    } else {
      // Modo simulação para navegadores sem suporte NFC
      setSimulationMode(true)
      setIsNFCSupported(true)
    }
  }, [])

  const startNFCReading = useCallback(async () => {
    if (!isActive) return

    setStatus('reading')
    onStatusChange('reading')

    if (simulationMode) {
      // Simular leitura NFC para demonstração
      setTimeout(() => {
        const randomNFC = validNFCCards[Math.floor(Math.random() * validNFCCards.length)]
        setStatus('success')
        onStatusChange('success')
        onRead(randomNFC)
      }, 2000)
      return
    }

    try {
      // Implementação real do NFC para dispositivos compatíveis
      if (typeof window !== 'undefined' && 'NDEFReader' in window) {
        const ndef = new (window as any).NDEFReader()
        
        // Solicitar permissões
        await ndef.scan()

        ndef.addEventListener('reading', (event: any) => {
          const textDecoder = new TextDecoder()
          let nfcData = ''

          // Novo: priorizar serialNumber
          if (event.serialNumber) {
            nfcData = event.serialNumber
          } else if (event.message && event.message.records) {
            for (const record of event.message.records) {
              if (record.recordType === 'text') {
                nfcData = textDecoder.decode(record.data)
                break
              } else if (record.recordType === 'url') {
                nfcData = textDecoder.decode(record.data)
                break
              }
            }
          }

          if (nfcData) {
            setStatus('success')
            onStatusChange('success')
            onRead(nfcData)
          } else {
            setStatus('error')
            onStatusChange('error')
          }
        })

        ndef.addEventListener('readingerror', () => {
          setStatus('error')
          onStatusChange('error')
        })
      }
    } catch (error) {
      console.error('Erro ao iniciar leitura NFC:', error)
      setStatus('error')
      onStatusChange('error')
    }
  }, [isActive, simulationMode, onRead, onStatusChange, validNFCCards])

  useEffect(() => {
    if (isActive && isNFCSupported) {
      startNFCReading()
    }
  }, [isActive, isNFCSupported, startNFCReading])

  const getStatusIcon = () => {
    switch (status) {
      case 'reading':
        return <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />
      default:
        return <Zap className="h-8 w-8 text-gray-400" />
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'reading':
        return 'Aguardando cartão NFC...'
      case 'success':
        return 'Cartão lido com sucesso!'
      case 'error':
        return 'Erro na leitura do cartão'
      default:
        return 'Pronto para ler'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'reading':
        return 'border-blue-300 bg-blue-50'
      case 'success':
        return 'border-green-300 bg-green-50'
      case 'error':
        return 'border-red-300 bg-red-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  if (!isNFCSupported) {
    return (
      <div className="text-center p-6">
        <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">NFC não suportado neste dispositivo</p>
        <p className="text-sm text-gray-500 mt-2">
          Use um dispositivo com suporte NFC para leitura de cartões
        </p>
      </div>
    )
  }

  return (
    <div className="text-center">
      {/* NFC Reading Area */}
      <motion.div
        className={`relative w-32 h-32 mx-auto mb-6 rounded-full border-4 border-dashed ${getStatusColor()} flex items-center justify-center`}
        animate={status === 'reading' ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: status === 'reading' ? Infinity : 0 }}
      >
        {getStatusIcon()}
        
        {status === 'reading' && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-blue-300"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Status Message */}
      <p className="text-sm font-medium text-gray-900 mb-2">
        {getStatusMessage()}
      </p>

      {/* Connection Status */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Wifi className="h-3 w-3" />
        <span>
          {simulationMode ? 'Modo Demonstração' : 'NFC Ativo'}
        </span>
      </div>

      {/* Simulation Button (only in demo mode) */}
      {simulationMode && status === 'reading' && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            const randomNFC = validNFCCards[Math.floor(Math.random() * validNFCCards.length)]
            setStatus('success')
            onStatusChange('success')
            onRead(randomNFC)
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Simular Leitura NFC
        </motion.button>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Instruções:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Aproxime o cartão NFC do dispositivo</li>
          <li>• Mantenha o cartão próximo até a confirmação</li>
          <li>• Aguarde a identificação do funcionário</li>
          {simulationMode && (
            <li className="text-blue-600">• Modo demonstração ativo</li>
          )}
        </ul>
      </div>
    </div>
  )
}
