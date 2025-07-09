'use client';

import { useState, useEffect } from 'react';
import { X, Scan, User, Search, Camera, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreateNFCBadgeData, AssignNFCBadgeData } from '@/lib/types/nfc-badges';
import { useCreateNFCBadge, useAssignNFCBadge } from '@/lib/useNFCBadges';
import { useEmployeesQuery } from '@/lib/useEmployeesQuery';
import NFCScanner from './NFCScanner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface Employee {
  id: string;
  name: string;
  cpf: string;
  registration: string | null;
  company: string | null;
  avatar: string | null;
}

interface NFCBadgeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NFCBadgeCreateModal({ isOpen, onClose }: NFCBadgeCreateModalProps) {
  const [step, setStep] = useState<'scan' | 'employee' | 'confirm'>('scan');
  const [scannedBadgeId, setScannedBadgeId] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState<{ badgeId: string; notes: string }>({ badgeId: '', notes: '' });

  const createMutation = useCreateNFCBadge();
  const assignMutation = useAssignNFCBadge();
  
  const { data: employeesData } = useEmployeesQuery({
    search: searchTerm,
    isActive: true,
    limit: 50,
  });

  const isLoading = createMutation.isPending || assignMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setStep('scan');
      setScannedBadgeId('');
      setSelectedEmployee(null);
      setSearchTerm('');
      setNotes('');
      setErrors({});
      setFormData({ badgeId: '', notes: '' });
      setIsScanning(false);
    }
  }, [isOpen]);

  const handleBadgeScanned = (badgeId: string) => {
    if (badgeId && badgeId.trim()) {
      setScannedBadgeId(badgeId);
      setFormData(prev => ({ ...prev, badgeId }));
      setIsScannerOpen(false);
      setStep('employee');
    } else {
      toast.error('Falha na leitura, tente novamente');
    }
  };

  const handleScanError = () => {
    toast.error('Falha na leitura, tente novamente');
  };

  const handleManualEntry = () => {
    if (!formData.badgeId.trim()) {
      setErrors({ badgeId: 'ID do crachá é obrigatório' });
      return;
    }
    setStep('employee');
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    try {
      // 1. Criar o crachá
      const badgeId = scannedBadgeId || formData.badgeId;
      const createData: CreateNFCBadgeData = {
        badgeId: badgeId.trim(), // Garantir que não há espaços
        notes: notes.trim() || undefined, // Garantir que não há espaços
      };
      
      console.log('Creating badge with data:', createData); // Debug
      
      const createdBadge = await createMutation.mutateAsync(createData);

      // 2. Se funcionário selecionado, atribuir automaticamente
      if (selectedEmployee) {
        const assignData: AssignNFCBadgeData = {
          employeeId: selectedEmployee.id,
          notes: `Atribuído automaticamente durante criação - ${notes}`,
        };
        
        await assignMutation.mutateAsync({ 
          id: createdBadge.id, 
          data: assignData 
        });
      }

      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      // Erro já tratado pelos hooks
    }
  };

  const handleBack = () => {
    if (step === 'employee') setStep('scan');
    if (step === 'confirm') setStep('employee');
  };

  const handleScan = () => {
    setIsScannerOpen(true);
  };

  if (!isOpen) return null;

  const employees = employeesData?.employees || [];
  const filteredEmployees = employees.filter(emp => 
    !emp.nfcBadge || emp.nfcBadge.status !== 'ASSIGNED'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">
              Novo Crachá NFC
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'scan' ? 'bg-blue-600 text-white' : 
                (scannedBadgeId || formData.badgeId) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${(scannedBadgeId || formData.badgeId) ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'employee' ? 'bg-blue-600 text-white' : 
                selectedEmployee ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-12 h-1 ${selectedEmployee ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Passo 1: Leitura do Crachá */}
          {step === 'scan' && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                  <Scan className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Leitura do Crachá NFC
                </h3>
                <p className="text-sm text-gray-600">
                  Clique no botão para iniciar a leitura ou digite o ID manualmente
                </p>
              </div>

              {/* Instruções de uso */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  📋 Instruções de Uso
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Clique no botão "Iniciar Scanner" para ativar a leitura NFC</li>
                  <li>• Aproxime o crachá do leitor NFC do dispositivo</li>
                  <li>• Aguarde a confirmação da leitura</li>
                  <li>• Ou digite o ID do crachá manualmente no campo abaixo</li>
                  <li>• Após a leitura, você poderá atribuir o crachá a um funcionário</li>
                </ul>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <button
                    onClick={handleScan}
                    disabled={isScannerOpen}
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Scan className="h-5 w-5 mr-3" />
                    Iniciar Scanner
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">ou digite manualmente</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="badgeId" className="text-sm font-medium text-gray-700">
                      ID do Crachá
                    </Label>
                    <Input
                      id="badgeId"
                      type="text"
                      placeholder="Ex: aa:bb:cc:dd"
                      value={formData.badgeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, badgeId: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                      Observações (opcional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Adicione observações sobre o crachá..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {formData.badgeId && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleManualEntry}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Continuar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Employee */}
          {step === 'employee' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Selecionar Funcionário</h3>
                <p className="text-gray-600">Escolha o funcionário para vincular ao crachá</p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF ou matrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Employee List */}
              <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredEmployees.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {searchTerm ? 'Nenhum funcionário encontrado' : 'Digite para buscar funcionários'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedEmployee?.id === employee.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {employee.avatar ? (
                              <img
                                src={employee.avatar}
                                alt={employee.name}
                                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          
                          {/* Employee Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{employee.name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-gray-500">CPF: {employee.cpf}</p>
                              {employee.registration && (
                                <p className="text-sm text-gray-500">Mat: {employee.registration}</p>
                              )}
                              {employee.company && (
                                <p className="text-sm text-gray-500">{employee.company}</p>
                              )}
                            </div>
                          </div>

                          {/* Selection Indicator */}
                          {selectedEmployee?.id === employee.id && (
                            <div className="flex-shrink-0">
                              <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Option to skip employee selection */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setStep('confirm');
                  }}
                  className="text-gray-600"
                >
                  Pular - Criar apenas o crachá
                </Button>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Voltar
                </Button>
                <Button 
                  onClick={() => setStep('confirm')}
                  disabled={!selectedEmployee}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Confirmar Criação</h3>
                <p className="text-gray-600">Revise as informações antes de criar</p>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                {/* Badge Info */}
                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Informações do Crachá</h4>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">ID: {scannedBadgeId || formData.badgeId}</p>
                      <p className="text-sm text-gray-500">Status: Disponível</p>
                    </div>
                  </div>
                </Card>

                {/* Employee Info */}
                {selectedEmployee ? (
                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Funcionário Selecionado</h4>
                    <div className="flex items-center gap-4">
                      {selectedEmployee.avatar ? (
                        <img
                          src={selectedEmployee.avatar}
                          alt={selectedEmployee.name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{selectedEmployee.name}</p>
                        <p className="text-sm text-gray-500">
                          CPF: {selectedEmployee.cpf}
                          {selectedEmployee.registration && ` • Mat: ${selectedEmployee.registration}`}
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4 border-dashed border-gray-300">
                    <p className="text-center text-gray-500">
                      Crachá será criado sem vinculação inicial
                    </p>
                  </Card>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  placeholder="Observações sobre o crachá..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Voltar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Criando...' : 'Criar Crachá'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* NFC Scanner Modal */}
      <NFCScanner
        isOpen={isScannerOpen}
        onClose={() => {
          setIsScannerOpen(false);
          setIsScanning(false);
        }}
        onBadgeDetected={handleBadgeScanned}
        onError={handleScanError}
        autoStart={true}
      />
    </div>
  );
} 