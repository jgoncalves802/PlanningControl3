'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Download, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

interface ImportResult {
  success: number
  errors: string[]
  duplicates: string[]
  created: string[]
}

interface FunctionImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: (result: ImportResult) => void
}

export default function FunctionImportDialog({ 
  isOpen, 
  onClose, 
  onImportComplete 
}: FunctionImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/functions/import', {
        method: 'GET'
      })
      
      if (!response.ok) {
        throw new Error('Erro ao baixar modelo')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'modelo-importacao-funcoes.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Modelo baixado com sucesso!')
    } catch (error) {
      console.error('Erro ao baixar modelo:', error)
      toast.error('Erro ao baixar modelo')
    }
  }

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n')
    
    // Detectar se há BOM e removê-lo
    const firstLine = lines[0].replace(/^\uFEFF/, '')
    lines[0] = firstLine
    
    // Função para parsear linha CSV considerando aspas
    const parseCSVLine = (line: string) => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Aspas duplas escapadas
            current += '"'
            i++ // Pular próxima aspa
          } else {
            // Alternar estado de aspas
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          // Separador encontrado fora de aspas
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      // Adicionar último campo
      result.push(current.trim())
      return result
    }
    
    const headers = parseCSVLine(lines[0])
    
    // Mapear headers para chaves esperadas (flexível)
    const headerMap: { [key: string]: string } = {}
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim()
      if (normalizedHeader.includes('nome') || normalizedHeader === 'name') {
        headerMap[index] = 'name'
      } else if (normalizedHeader.includes('tipo') || normalizedHeader.includes('mão') || normalizedHeader.includes('obra') || normalizedHeader === 'labortype') {
        headerMap[index] = 'laborType'
      }
    })
    
    const functions = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      
      // Pular linhas vazias
      if (values.every(v => v === '')) continue
      
      const func: any = {}
      
      // Mapear valores usando o mapeamento de headers
      Object.keys(headerMap).forEach(index => {
        const key = headerMap[index]
        const value = values[parseInt(index)]
        
        if (key === 'name') {
          func.name = value
        } else if (key === 'laborType') {
          // Normalizar tipo de mão de obra
          const normalized = value.toUpperCase().trim()
          if (normalized === 'DIRETO' || normalized === 'DIRETA' || normalized === 'DIRECT') {
            func.laborType = 'DIRETO'
          } else if (normalized === 'INDIRETO' || normalized === 'INDIRETA' || normalized === 'INDIRECT') {
            func.laborType = 'INDIRETO'
          } else {
            func.laborType = value // Manter original para validação na API
          }
        }
      })
      
      // Só adicionar se tiver pelo menos o nome
      if (func.name && func.name.trim() !== '') {
        functions.push(func)
      }
    }
    
    return functions
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validar tipo de arquivo
    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV')
      return
    }

    setIsProcessing(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const functions = parseCSV(text)
      
      if (functions.length === 0) {
        toast.error('Nenhuma função encontrada no arquivo. Verifique se o arquivo está no formato correto.')
        setIsProcessing(false)
        return
      }

      // Enviar para API
      const response = await fetch('/api/functions/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ functions })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro na importação')
      }

      const result = await response.json()
      setImportResult(result.results)
      onImportComplete(result.results)
      
      // Invalidar cache das funções
      queryClient.invalidateQueries({ queryKey: ['functions'] })
      
      if (result.results.success > 0) {
        toast.success(`${result.results.success} função(ões) importada(s) com sucesso!`)
      }

    } catch (error) {
      console.error('Erro na importação:', error)
      toast.error(`Erro na importação: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleClose = () => {
    setImportResult(null)
    setIsProcessing(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Importar Funções em Massa
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instruções melhoradas */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Como importar funções:
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
              <li><strong>Baixe o modelo CSV</strong> clicando no botão abaixo</li>
              <li><strong>Abra no Excel</strong> e preencha os dados das funções</li>
              <li><strong>Salve como CSV</strong> (manter formato CSV)</li>
              <li><strong>Faça upload</strong> do arquivo preenchido</li>
              <li><strong>Aguarde o processamento</strong> da importação</li>
            </ol>
            
            <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-300 dark:border-blue-700">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
                ✅ Informações importantes:
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• <strong>Todas as funções</strong> são criadas como <strong>ATIVAS</strong> automaticamente</li>
                <li>• <strong>Caracteres especiais</strong> são suportados (ç, ã, é, etc.)</li>
                <li>• <strong>Tipo de mão de obra:</strong> use "DIRETO" ou "INDIRETO"</li>
                <li>• <strong>Nomes duplicados</strong> serão ignorados (sem sobrescrever)</li>
              </ul>
            </div>
          </div>

          {/* Botão para baixar modelo */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800 dark:text-green-300"
            >
              <Download className="h-4 w-4" />
              Baixar Modelo Excel (CSV)
            </Button>
          </div>

          {/* Área de upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                {isProcessing ? (
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                ) : (
                  <Upload className="h-12 w-12 text-gray-400 dark:text-slate-500" />
                )}
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-slate-100">
                  {isProcessing ? 'Processando arquivo...' : 'Arraste o arquivo CSV aqui'}
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  ou clique para selecionar
                </p>
              </div>
              
              {!isProcessing && (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Selecionar Arquivo CSV
                </Button>
              )}
            </div>
          </div>

          {/* Resultado da importação */}
          <AnimatePresence>
            {importResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Resultado da Importação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Resumo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {importResult.success}
                        </div>
                        <div className="text-sm text-green-800 dark:text-green-300">
                          Funções criadas (ativas)
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {importResult.errors.length + importResult.duplicates.length}
                        </div>
                        <div className="text-sm text-yellow-800 dark:text-yellow-300">
                          Problemas encontrados
                        </div>
                      </div>
                    </div>

                    {/* Funções criadas */}
                    {importResult.created.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                          ✅ Funções criadas com sucesso:
                        </h4>
                        <div className="max-h-32 overflow-y-auto bg-green-50 dark:bg-green-900/10 p-3 rounded border border-green-200 dark:border-green-800">
                          {importResult.created.map((name, index) => (
                            <div key={index} className="text-sm text-green-700 dark:text-green-400">
                              • {name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Duplicatas */}
                    {importResult.duplicates.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                          ⚠️ Funções já existentes (ignoradas):
                        </h4>
                        <div className="max-h-32 overflow-y-auto bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                          {importResult.duplicates.map((error, index) => (
                            <div key={index} className="text-sm text-yellow-700 dark:text-yellow-400">
                              • {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Erros */}
                    {importResult.errors.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                          ❌ Erros encontrados:
                        </h4>
                        <div className="max-h-32 overflow-y-auto bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-200 dark:border-red-800">
                          {importResult.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-700 dark:text-red-400">
                              • {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            {importResult ? 'Fechar' : 'Cancelar'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
} 
