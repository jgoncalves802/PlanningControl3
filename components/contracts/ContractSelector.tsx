'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  Clock, 
  Calendar, 
  Search, 
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useActiveContractsWithFunctions } from '@/lib/hooks/useActiveContracts';
import { ActiveContract } from '@/lib/hooks/useActiveContracts';

interface ContractSelectorProps {
  onContractSelect: (contract: ActiveContract) => void;
  selectedContractId?: string;
  className?: string;
}

export default function ContractSelector({
  onContractSelect,
  selectedContractId,
  className = ''
}: ContractSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useActiveContractsWithFunctions(searchTerm);

  const handleContractClick = (contract: ActiveContract) => {
    onContractSelect(contract);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Selecionar Contrato Destino
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando contratos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Selecionar Contrato Destino
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>Erro ao carregar contratos</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const contracts = data?.contracts || [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Contratos Disponíveis ({contracts.length})
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar contratos por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum contrato ativo encontrado</p>
              {searchTerm && (
                <p className="text-sm mt-2">
                  Tente ajustar os termos de busca
                </p>
              )}
            </div>
          ) : (
            contracts.map((contract) => (
              <div
                key={contract.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedContractId === contract.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                onClick={() => handleContractClick(contract)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                        {contract.name}
                      </h3>
                      {selectedContractId === contract.id && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-2">
                      {contract.code}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{contract.workdayHours}h/dia</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{contract.employeeCount || 0} funcionários</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(contract.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {contract.includesWeekends ? 'Inclui FDS' : 'Não inclui FDS'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {contract.includesHolidays ? 'Inclui Feriados' : 'Não inclui Feriados'}
                      </Badge>
                    </div>

                    {contract.functions && contract.functions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Funções disponíveis:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {contract.functions.slice(0, 3).map((func) => (
                            <Badge 
                              key={func.id} 
                              variant="outline" 
                              className="text-xs"
                            >
                              {func.name} ({func.employeeCount})
                            </Badge>
                          ))}
                          {contract.functions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{contract.functions.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <ArrowRight className="h-5 w-5 text-gray-400 ml-2" />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 