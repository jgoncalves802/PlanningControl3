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
  Filter,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useActiveContractsWithFunctions } from '@/lib/hooks/useActiveContracts';
import { ActiveContract } from '@/lib/hooks/useActiveContracts';

interface ActiveContractsListProps {
  onContractSelect?: (contract: ActiveContract) => void;
  showFunctions?: boolean;
  showEmployeeCount?: boolean;
  maxHeight?: string;
  className?: string;
}

export default function ActiveContractsList({
  onContractSelect,
  showFunctions = true,
  showEmployeeCount = true,
  maxHeight = '400px',
  className = ''
}: ActiveContractsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  const { data, isLoading, error } = useActiveContractsWithFunctions(searchTerm);

  const handleContractClick = (contract: ActiveContract) => {
    setSelectedContract(contract.id);
    onContractSelect?.(contract);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Contratos Ativos
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
            Contratos Ativos
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
          Contratos Ativos ({contracts.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="space-y-3 overflow-y-auto"
          style={{ maxHeight }}
        >
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
                  selectedContract === contract.id
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
                      <Badge className={`text-xs ${getStatusColor(contract.isActive)}`}>
                        {contract.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-2">
                      {contract.code}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{contract.workdayHours}h/dia</span>
                      </div>
                      
                      {showEmployeeCount && contract.employeeCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{contract.employeeCount} funcionários</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Criado em {formatDate(contract.createdAt)}</span>
                      </div>
                    </div>

                    {showFunctions && contract.functions && contract.functions.length > 0 && (
                      <div className="mt-3">
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