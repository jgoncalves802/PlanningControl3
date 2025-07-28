'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  Clock, 
  Calendar, 
  ArrowRight,
  FileText,
  CheckCircle
} from 'lucide-react';
import ActiveContractsList from '@/components/contracts/ActiveContractsList';
import { ActiveContract } from '@/lib/hooks/useActiveContracts';

export default function ActiveContractsPage() {
  const [selectedContract, setSelectedContract] = useState<ActiveContract | null>(null);

  const handleContractSelect = (contract: ActiveContract) => {
    setSelectedContract(contract);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            Contratos Ativos
          </h1>
          <p className="text-gray-600 mt-2">
            Visualize e selecione contratos ativos para receber colaboradores
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Contratos Ativos */}
        <div className="lg:col-span-2">
          <ActiveContractsList
            onContractSelect={handleContractSelect}
            showFunctions={true}
            showEmployeeCount={true}
            maxHeight="600px"
          />
        </div>

        {/* Detalhes do Contrato Selecionado */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedContract ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-slate-100">
                      {selectedContract.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {selectedContract.code}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedContract.workdayHours} horas por dia
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedContract.employeeCount || 0} funcionários
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Criado em {formatDate(selectedContract.createdAt)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedContract.includesWeekends ? 'Inclui FDS' : 'Não inclui FDS'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedContract.includesHolidays ? 'Inclui Feriados' : 'Não inclui Feriados'}
                      </Badge>
                    </div>
                  </div>

                  {selectedContract.functions && selectedContract.functions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                        Funções Disponíveis
                      </h4>
                      <div className="space-y-2">
                        {selectedContract.functions.map((func) => (
                          <div
                            key={func.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <span className="text-sm font-medium">
                              {func.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {func.employeeCount} funcionários
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button className="w-full">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Selecionar Contrato
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Selecione um contrato para ver os detalhes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 