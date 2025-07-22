'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  robustNormalizeText, 
  validateFileEncoding, 
  parseCSVWithEncoding, 
  validateEmployeeDataInRealTime,
  createTestCSVTemplate,
  generateEncodingReport,
  processCSVWithAutoCorrection,
  autoCorrectEmployeeData,
  ValidationResult 
} from '@/lib/csvEncodingUtils';

interface ImportResult {
  success: boolean;
  summary: {
    total: number;
    created: number;
    failed: number;
  };
  results: Array<{
    index: number;
    name: string;
    registration: string;
    status: 'success' | 'error';
    id?: string;
    errors?: Record<string, string>;
  }>;
  createdEmployees: Array<{
    id: string;
    name: string;
    registration: string;
    cpf: string;
  }>;
  failedEmployees: Array<{
    index: number;
    name: string;
    errors: Record<string, string>;
  }>;
}

interface ImportProgress {
  current: number;
  total: number;
  currentEmployee: string;
  status: 'preparing' | 'processing' | 'completed' | 'error';
  stage: 'validation' | 'correction' | 'import' | 'finalizing';
  message: string;
}

interface ImportEmployeesDialogProps {
  onImportComplete?: (result: ImportResult) => void;
}

export function ImportEmployeesDialog({ onImportComplete }: ImportEmployeesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [encodingValidation, setEncodingValidation] = useState<ValidationResult | null>(null);
  const [encodingReport, setEncodingReport] = useState<string>('');
  const [autoCorrections, setAutoCorrections] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para converter CSV para JSON com validação de encoding
  const parseCSV = (csvText: string): any[] => {
    // Usar processamento com correção automática
    const { data, corrections, encodingIssues } = processCSVWithAutoCorrection(csvText);
    
    // Armazenar correções para exibição
    setAutoCorrections(corrections);
    
    // Mostrar avisos sobre correções aplicadas
    if (corrections.length > 0) {
      toast.success(`${corrections.length} correções automáticas aplicadas`);
    }
    
    // Mostrar avisos sobre problemas de encoding
    if (encodingIssues.length > 0) {
      toast.error(`${encodingIssues.length} problemas de encoding detectados`);
    }
    
    return data;
  };

  // Função para processar arquivo CSV com validação de encoding
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    try {
      const text = await file.text();
      const data = parseCSV(text);
      setCsvData(data);
      
      // Validar encoding do arquivo
      const validation = await validateFileEncoding(file);
      setEncodingValidation(validation);
      
      if (validation.isValid) {
        toast.success('Arquivo CSV carregado com sucesso!');
      } else {
        toast.error('Problemas de encoding detectados no arquivo');
      }
      
      // Gerar relatório de encoding
      const report = generateEncodingReport(data);
      setEncodingReport(report);
      
    } catch (error) {
      toast.error('Erro ao validar encoding do arquivo');
      console.error('Erro na validação:', error);
    }
  };

  // Função para fazer a importação com progresso
  const handleImport = async () => {
    if (csvData.length === 0) {
      toast.error('Nenhum dado para importar');
      return;
    }

    setIsLoading(true);
    setImportProgress({
      current: 0,
      total: csvData.length,
      currentEmployee: '',
      status: 'preparing',
      stage: 'validation',
      message: 'Iniciando validação dos dados...'
    });

    try {
      // Estágio 1: Validação
      setImportProgress(prev => prev ? {
        ...prev,
        stage: 'validation',
        message: 'Validando dados dos funcionários...'
      } : null);

      // Estágio 2: Correção automática
      setImportProgress(prev => prev ? {
        ...prev,
        stage: 'correction',
        message: 'Aplicando correções automáticas...'
      } : null);

      const correctedEmployees = [];
      const allCorrections: string[] = [];

      for (let i = 0; i < csvData.length; i++) {
        const employee = csvData[i];
        setImportProgress(prev => prev ? {
          ...prev,
          current: i + 1,
          currentEmployee: employee.name || `Funcionário ${i + 1}`,
          message: `Aplicando correções em: ${employee.name || `Funcionário ${i + 1}`}`
        } : null);

        const { correctedData, corrections } = autoCorrectEmployeeData(employee);
        correctedEmployees.push(correctedData);
        
        if (corrections.length > 0) {
          allCorrections.push(...corrections);
        }

        // Pequena pausa para mostrar o progresso
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Mostrar resumo das correções aplicadas
      if (allCorrections.length > 0) {
        console.log('Correções automáticas aplicadas:', allCorrections);
      }

      // Estágio 3: Importação
      setImportProgress(prev => prev ? {
        ...prev,
        stage: 'import',
        current: 0,
        message: 'Iniciando importação no banco de dados...'
      } : null);

      const response = await fetch('/api/employees/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(correctedEmployees),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na importação');
      }

      const result = await response.json();
      
      // Estágio 4: Finalização
      setImportProgress(prev => prev ? {
        ...prev,
        stage: 'finalizing',
        current: csvData.length,
        message: 'Finalizando importação...'
      } : null);

      setImportResult(result);
      
      if (onImportComplete) {
        onImportComplete(result);
      }

      if (result.success) {
        toast.success(`Importação concluída! ${result.summary.created} funcionários criados.`);
      } else {
        toast.error(`Importação falhou! ${result.summary.failed} erros encontrados.`);
      }

      // Marcar como concluído
      setImportProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        message: 'Importação concluída com sucesso!'
      } : null);

    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error(`Erro na importação: ${error.message}`);
      
      setImportProgress(prev => prev ? {
        ...prev,
        status: 'error',
        message: `Erro: ${error.message}`
      } : null);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para baixar modelo CSV com caracteres especiais
  const downloadTemplate = () => {
    const csvContent = createTestCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_importacao_funcionarios.csv';
    link.click();
    toast.success('Modelo CSV baixado com sucesso!');
  };

  // Reset do dialog
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCsvData([]);
      setImportResult(null);
      setEncodingValidation(null);
      setEncodingReport('');
      setAutoCorrections([]);
      setImportProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
          {progress.currentEmployee && (
            <div className="text-xs text-gray-500 mt-1">
              Processando: {progress.currentEmployee}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
        <Upload className="h-4 w-4" />
        Importar em Massa
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importação em Massa de Funcionários</DialogTitle>
          <DialogDescription>
            Importe múltiplos funcionários através de um arquivo CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seção de Upload */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">1. Selecionar Arquivo CSV</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar Modelo
                </Button>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Selecionar Arquivo CSV
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Arquivo deve estar no formato CSV com separador ponto e vírgula (;)
                </p>
              </div>

              {csvData.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="ml-2 text-sm text-green-800">
                      {csvData.length} registros carregados e prontos para importação
                    </span>
                  </div>
                </div>
              )}

              {/* Seção de Validação de Encoding */}
              {encodingValidation && (
                <div className={`border rounded-md p-3 ${
                  encodingValidation.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start">
                    {encodingValidation.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="ml-2 text-sm">
                      <p className={`font-medium ${
                        encodingValidation.isValid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        Validação de Encoding: {encodingValidation.isValid ? 'APROVADO' : 'REPROVADO'}
                      </p>
                      
                      {encodingValidation.warnings.length > 0 && (
                        <div className="mt-2">
                          <p className="text-yellow-700 font-medium">Avisos:</p>
                          <ul className="list-disc list-inside text-yellow-700">
                            {encodingValidation.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {encodingValidation.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-red-700 font-medium">Erros:</p>
                          <ul className="list-disc list-inside text-red-700">
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

              {/* Relatório de Encoding */}
              {encodingReport && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="ml-2 text-sm text-blue-800">
                      <p className="font-medium">Relatório de Encoding:</p>
                      <pre className="mt-2 text-xs whitespace-pre-wrap font-mono">
                        {encodingReport}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Correções Automáticas Aplicadas */}
              {autoCorrections.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="ml-2 text-sm text-green-800">
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
                          <div key={index} className="text-xs text-green-700">
                            • {correction}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Seção de Importação */}
          {csvData.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">2. Executar Importação</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="ml-2 text-sm text-yellow-800">
                      <p className="font-medium">Atenção:</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>CPFs serão validados pelo algoritmo oficial</li>
                        <li>Matrículas devem ser únicas por empresa</li>
                        <li>Datas devem estar no formato DD/MM/YYYY</li>
                        <li>Telefones devem ter 10 ou 11 dígitos</li>
                        <li>Arquivo deve estar em <strong>UTF-8</strong> para caracteres especiais</li>
                        <li>Nomes com acentos (João, Antônia) serão normalizados automaticamente</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Progresso da importação */}
                {importProgress && (
                  <div className="mb-4">
                    <ProgressBar progress={importProgress} />
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={isLoading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Importar {csvData.length} Funcionários
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Resultado da Importação */}
          {importResult && (
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">3. Resultado da Importação</h3>
              
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {importResult.summary.total}
                  </div>
                  <div className="text-sm text-blue-800">Total</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {importResult.summary.created}
                  </div>
                  <div className="text-sm text-green-800">Criados</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {importResult.summary.failed}
                  </div>
                  <div className="text-sm text-red-800">Falharam</div>
                </div>
              </div>

              {/* Lista de Erros */}
              {importResult.failedEmployees.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-800">Funcionários com Erro:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {importResult.failedEmployees.map((emp, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="flex items-start">
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="ml-2 flex-1">
                            <p className="font-medium text-red-800">
                              Linha {emp.index}: {emp.name || 'Nome não informado'}
                            </p>
                            <ul className="mt-1 text-sm text-red-700 space-y-1">
                              {Object.entries(emp.errors).map(([field, error]) => (
                                <li key={field}>• {field}: {error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de Sucessos */}
              {importResult.createdEmployees.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="font-medium text-green-800">Funcionários Criados:</h4>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="grid gap-2">
                      {importResult.createdEmployees.map((emp, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-md p-2">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="ml-2 text-sm text-green-800">
                              {emp.name} - Matrícula: {emp.registration}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
