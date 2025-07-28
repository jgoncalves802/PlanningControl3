'use client'

import React, { useState, useRef } from 'react'
import { 
  Upload, 
  Download, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Info,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { 
  robustNormalizeText, 
  validateFileEncoding, 
  processCSVWithAutoCorrection,
  autoCorrectFunctionData,
  ValidationResult,
  convertFileToUTF8,
  detectFileEncoding
} from '@/lib/csvEncodingUtils'

interface ImportResult {
  success: number
  errors: string[]
  duplicates: string[]
  created: string[]
}

interface ImportProgress {
  current: number;
  total: number;
  currentFunction: string;
  status: 'preparing' | 'processing' | 'completed' | 'error';
  stage: 'validation' | 'correction' | 'import' | 'finalizing';
  message: string;
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
  const [encodingValidation, setEncodingValidation] = useState<ValidationResult | null>(null)
  const [autoCorrections, setAutoCorrections] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
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

  // Função para converter CSV para JSON com validação de encoding (copiada da importação de funcionários)
  const parseCSV = (csvText: string): any[] => {
    // Usar processamento com correção automática (mesmo da importação de funcionários)
    const { data, corrections, encodingIssues } = processCSVWithAutoCorrection(csvText)
    
    // Armazenar correções para exibição
    setAutoCorrections(corrections)
    
    // Mostrar avisos sobre correções aplicadas
    if (corrections.length > 0) {
      toast.success(`${corrections.length} correções automáticas aplicadas`)
    }
    
    // Mostrar avisos sobre problemas de encoding
    if (encodingIssues.length > 0) {
      toast.error(`${encodingIssues.length} problemas de encoding detectados`)
    }
    
    // Processar dados para funções
    const processedFunctions = data.map((row: any) => {
      const func: any = {}
      
      // Mapear campos normalizados para os nomes esperados
      Object.keys(row).forEach(key => {
        if (key === 'nomedafuncao' || key === 'nomedafuno' || key === 'name') {
          func.name = robustNormalizeText(row[key])
        } else if (key === 'tipodemaodeobra' || key === 'tipodemodeobra' || key === 'labortype' || key === 'laborType') {
          const laborType = row[key]
          const normalized = laborType.toUpperCase().trim()
          if (normalized === 'DIRETO' || normalized === 'DIRETA' || normalized === 'DIRECT') {
            func.laborType = 'DIRETO'
          } else if (normalized === 'INDIRETO' || normalized === 'INDIRETA' || normalized === 'INDIRECT') {
            func.laborType = 'INDIRETO'
          } else {
            func.laborType = normalized
          }
        }
      })
      
      return func
    }).filter(func => func.name && func.name.trim() !== '')
    
    return processedFunctions
  }

  // Função para processar arquivo CSV com validação de encoding (copiada da importação de funcionários)
  const handleFileUpload = async (file: File) => {
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV')
      return
    }

    setIsProcessing(true)
    setImportResult(null)
    setEncodingValidation(null)
    setAutoCorrections([])
    setCsvData([])

    try {
      // Estágio 1: Validação
      setImportProgress({
        current: 0,
        total: 1,
        currentFunction: '',
        status: 'preparing',
        stage: 'validation',
        message: 'Validando encoding do arquivo...'
      })

      // Validar encoding do arquivo
      const validation = await validateFileEncoding(file)
      setEncodingValidation(validation)
      
      if (validation.isValid) {
        toast.success('Arquivo CSV carregado com sucesso!')
      } else {
        toast.error('Problemas de encoding detectados no arquivo')
        setIsProcessing(false)
        setImportProgress(null)
        return
      }

      // Estágio 2: Processamento
      setImportProgress(prev => prev ? {
        ...prev,
        stage: 'correction',
        message: 'Processando arquivo CSV...'
      } : null)

      // Converter arquivo para UTF-8 se necessário
      const encoding = await detectFileEncoding(file)
      console.log(`🔍 Encoding detectado: ${encoding}`)
      
      const text = await convertFileToUTF8(file)
      const functions = parseCSV(text)
      setCsvData(functions)
      
      if (functions.length === 0) {
        toast.error('Nenhuma função encontrada no arquivo. Verifique se o arquivo está no formato correto.')
        setIsProcessing(false)
        setImportProgress(null)
        return
      }

      // Estágio 3: Importação
      setImportProgress(prev => prev ? {
        ...prev,
        stage: 'import',
        current: 0,
        total: functions.length,
        message: 'Iniciando importação no banco de dados...'
      } : null)

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
      
      // Estágio 4: Finalização
      setImportProgress(prev => prev ? {
        ...prev,
        stage: 'finalizing',
        current: functions.length,
        message: 'Finalizando importação...'
      } : null)

      setImportResult(result.results)
      onImportComplete(result.results)
      
      // Invalidar cache das funções
      queryClient.invalidateQueries({ queryKey: ['functions'] })
      
      if (result.results.success > 0) {
        toast.success(`${result.results.success} função(ões) importada(s) com sucesso!`)
      }

      // Marcar como concluído
      setImportProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        message: 'Importação concluída com sucesso!'
      } : null)

    } catch (error: any) {
      console.error('Erro na importação:', error)
      toast.error(`Erro na importação: ${error.message}`)
      
      setImportProgress(prev => prev ? {
        ...prev,
        status: 'error',
        message: `Erro: ${error.message}`
      } : null)
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
    setEncodingValidation(null)
    setAutoCorrections([])
    setImportProgress(null)
    setCsvData([])
    onClose()
  }

  // Componente de progresso
  const ProgressBar = ({ progress }: { progress: ImportProgress }) => {
    const percentage = (progress.current / progress.total) * 100;
    
    const getStageColor = (stage: string) => {
      switch (stage) {
        case 'validation': return 'bg-blue-500';
        case 'correction': return 'bg-yellow-500';
        case 'import': return 'bg-green-500';
        case 'finalizing': return 'bg-purple-500';
        default: return 'bg-gray-500';
      }
    };

    const getStageIcon = (stage: string) => {
      switch (stage) {
        case 'validation': return <FileText className="h-4 w-4" />;
        case 'correction': return <AlertTriangle className="h-4 w-4" />;
        case 'import': return <Upload className="h-4 w-4" />;
        case 'finalizing': return <CheckCircle className="h-4 w-4" />;
        default: return <Loader2 className="h-4 w-4 animate-spin" />;
      }
    };

    const getStageName = (stage: string) => {
      switch (stage) {
        case 'validation': return 'Validação';
        case 'correction': return 'Correção';
        case 'import': return 'Importação';
        case 'finalizing': return 'Finalização';
        default: return 'Processando';
      }
    };

    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStageIcon(progress.stage)}
            <span className="font-medium text-sm">{getStageName(progress.stage)}</span>
          </div>
          <span className="text-sm text-gray-600">
            {progress.current} / {progress.total}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStageColor(progress.stage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="text-sm text-gray-600">
          <div className="font-medium">{progress.message}</div>
          {progress.currentFunction && (
            <div className="text-xs text-gray-500 mt-1">
              Processando: {progress.currentFunction}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                <li>• <strong>Arquivo deve estar em UTF-8</strong> para caracteres especiais</li>
                <li>• <strong>Tipo de mão de obra:</strong> use "DIRETO" ou "INDIRETO"</li>
                <li>• <strong>Nomes duplicados</strong> serão ignorados (sem sobrescrever)</li>
                <li>• <strong>Nomes com acentos</strong> serão normalizados automaticamente</li>
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
                <FileSpreadsheet className="h-12 w-12 text-gray-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                  {dragActive ? 'Solte o arquivo aqui' : 'Arraste e solte ou clique para selecionar'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Apenas arquivos CSV são aceitos
                </p>
              </div>
              
              {!dragActive && (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Selecionar Arquivo CSV
                </Button>
              )}
            </div>
          </div>

          {/* Progresso da importação */}
          {importProgress && (
            <div className="mb-4">
              <ProgressBar progress={importProgress} />
            </div>
          )}

          {/* Seção de Validação de Encoding */}
          {encodingValidation && (
            <div className={`border rounded-md p-3 ${
              encodingValidation.isValid 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <div className="flex items-start">
                {encodingValidation.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="ml-2 text-sm">
                  <p className={`font-medium ${
                    encodingValidation.isValid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                  }`}>
                    Validação de Encoding: {encodingValidation.isValid ? 'APROVADO' : 'REPROVADO'}
                  </p>
                  
                  {encodingValidation.warnings.length > 0 && (
                    <div className="mt-2">
                      <p className="text-yellow-700 dark:text-yellow-300 font-medium">Avisos:</p>
                      <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300">
                        {encodingValidation.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {encodingValidation.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-700 dark:text-red-300 font-medium">Erros:</p>
                      <ul className="list-disc list-inside text-red-700 dark:text-red-300">
                        {encodingValidation.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Correções Automáticas Aplicadas */}
          {autoCorrections.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="ml-2 text-sm text-green-800 dark:text-green-300">
                  <p className="font-medium">✅ Correções Automáticas Aplicadas ({autoCorrections.length}):</p>
                  <div 
                    className="mt-2 max-h-32 overflow-y-auto"
                    ref={(el) => {
                      if (el) {
                        el.scrollTop = el.scrollHeight;
                      }
                    }}
                  >
                    {autoCorrections.map((correction, index) => (
                      <div key={index} className="text-xs text-green-700 dark:text-green-400">
                        • {correction}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resultado da importação */}
          {importResult && (
            <div className="space-y-4">
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
            </div>
          )}
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
      </div>
    </div>
  )
} 
