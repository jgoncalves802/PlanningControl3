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
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

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

interface ImportEmployeesDialogProps {
  onImportComplete?: (result: ImportResult) => void;
}

export function ImportEmployeesDialog({ onImportComplete }: ImportEmployeesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para converter CSV para JSON
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(';');
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });

      // Só adiciona se tiver pelo menos nome
      if (row.name) {
        data.push(row);
      }
    }

    return data;
  };

  // Função para processar arquivo CSV
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      try {
        const data = parseCSV(csvText);
        setCsvData(data);
        toast.success(`${data.length} registros carregados do CSV`);
      } catch (error) {
        toast.error('Erro ao processar arquivo CSV');
        console.error('Erro ao processar CSV:', error);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Função para fazer a importação
  const handleImport = async () => {
    if (csvData.length === 0) {
      toast.error('Nenhum dado para importar');
      return;
    }

    setIsLoading(true);
    setImportResult(null);

    try {
      const response = await fetch('/api/employees/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(csvData),
      });

      const result: ImportResult = await response.json();
      setImportResult(result);

      if (result.summary.created > 0) {
        toast.success(
          `${result.summary.created} funcionários importados com sucesso!`
        );
      }

      if (result.summary.failed > 0) {
        toast.warning(
          `${result.summary.failed} funcionários falharam na importação`
        );
      }

      onImportComplete?.(result);

    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro ao importar funcionários');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para baixar modelo CSV
  const downloadTemplate = () => {
    const headers = [
      'name', 'registration', 'company', 'cpf', 'phone', 'birthDate',
      'gender', 'maritalStatus', 'pis', 'ctps', 'ctpsSeries', 'ctpsUf',
      'motherName', 'role', 'category', 'currentContractId', 'admissionDate', 'status'
    ];

    const csvContent = headers.join(';') + '\n' +
      'João Silva Santos;12345;SARTORI SERVIÇOS;12345678901;31987654321;15/05/1985;Masculino;Solteiro;;;;;;;Operador;CLT;;01/03/2024;Ativo\n' +
      'Maria Santos Costa;12346;SARTORI SERVIÇOS;98765432100;31987654322;20/08/1990;Feminino;Casada;;;;;;;Auxiliar;CLT;;15/03/2024;Ativo';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_importacao_funcionarios.csv';
    link.click();
  };

  // Reset do dialog
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCsvData([]);
      setImportResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
                      </ul>
                    </div>
                  </div>
                </div>

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