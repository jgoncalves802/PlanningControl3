'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Building, 
  UserCheck, 
  UserX, 
  ArrowRight, 
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  Loader2
} from 'lucide-react';
import { mockContracts, mockEmployees } from '@/lib/mock-data';

interface Contract {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface Employee {
  id: string;
  name: string;
  cpf: string;
  registration?: string;
  status: string;
  isActive: boolean;
  contractId?: string;
  contractAssignmentDate?: string;
  currentContract?: {
    id: string;
    name: string;
    code: string;
  };
  address?: {
    cidade?: string;
  };
  admissionDate?: string;
}

export default function EmployeeAssignmentPage() {
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  
  // Estados de loading
  const [contractsLoading, setContractsLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [unlinkingLoading, setUnlinkingLoading] = useState<string | null>(null);

  // Carregar contratos
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setContractsLoading(true);
        const response = await fetch('/api/contracts?limit=100&isActive=true');
        if (response.ok) {
          const data = await response.json();
          if (data.contracts && data.contracts.length > 0) {
            setContracts(data.contracts);
          } else {
            // Usar dados mock se a API não retornar dados
            const mockContractsData = mockContracts.map(contract => ({
              id: contract.id,
              name: contract.name,
              code: contract.code,
              isActive: contract.isActive
            }));
            setContracts(mockContractsData);
          }
        } else {
          // Usar dados mock em caso de erro
          const mockContractsData = mockContracts.map(contract => ({
            id: contract.id,
            name: contract.name,
            code: contract.code,
            isActive: contract.isActive
          }));
          setContracts(mockContractsData);
        }
      } catch (error) {
        console.error('Erro ao carregar contratos:', error);
        // Usar dados mock em caso de erro
        const mockContractsData = mockContracts.map(contract => ({
          id: contract.id,
          name: contract.name,
          code: contract.code,
          isActive: contract.isActive
        }));
        setContracts(mockContractsData);
      } finally {
        setContractsLoading(false);
      }
    };

    fetchContracts();
  }, []);

  // Carregar funcionários
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);
        const params = new URLSearchParams({
          limit: '100',
          include: 'currentContract'
        });
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        if (statusFilter !== 'all') {
          params.append('isActive', statusFilter === 'active' ? 'true' : 'false');
        }

        const response = await fetch(`/api/employees?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (data.employees && data.employees.length > 0) {
            setEmployees(data.employees);
          } else {
            // Usar dados mock se a API não retornar dados
            setEmployees(mockEmployees);
          }
        } else {
          // Usar dados mock em caso de erro
          setEmployees(mockEmployees);
        }
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        // Usar dados mock em caso de erro
        setEmployees(mockEmployees);
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();
  }, [searchTerm, statusFilter]);

  // Filtrar apenas contratos ativos
  const activeContracts = contracts.filter(contract => contract.isActive);

  // Filtrar funcionários baseado nos filtros
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.cpf.includes(searchTerm) ||
                         (emp.registration && emp.registration.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && emp.isActive) ||
                         (statusFilter === 'inactive' && !emp.isActive);

    return matchesSearch && matchesStatus;
  });

  // Funcionários disponíveis (NÃO alocados em NENHUM contrato)
  const availableEmployees = filteredEmployees.filter(emp => !emp.contractId);
  
  // Funcionários vinculados ao contrato selecionado
  const linkedEmployees = selectedContractId ? 
    filteredEmployees.filter(emp => emp.contractId === selectedContractId) : 
    [];

  // Handlers
  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployeeIds.length === availableEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(availableEmployees.map(emp => emp.id));
    }
  };

  const handleLinkEmployees = async () => {
    if (!selectedContractId) {
      toast.error('Selecione um contrato primeiro');
      return;
    }

    if (selectedEmployeeIds.length === 0) {
      toast.error('Selecione pelo menos um funcionário');
      return;
    }

    try {
      setLinkingLoading(true);
      
      const response = await fetch(`/api/employees/${selectedEmployeeIds[0]}/assignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeIds: selectedEmployeeIds,
          contractId: selectedContractId,
          contractAssignmentDate: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao vincular funcionários');
      }

      const result = await response.json();
      toast.success(result.message);
      setSelectedEmployeeIds([]);
      
      // Recarregar funcionários para refletir as mudanças
      window.location.reload();
    } catch (error) {
      console.error('Erro ao vincular funcionários:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao vincular funcionários');
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleUnlinkEmployee = async (employeeId: string) => {
    try {
      setUnlinkingLoading(employeeId);
      
      const response = await fetch(`/api/employees/${employeeId}/assignment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: null,
          contractAssignmentDate: null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao desvincular funcionário');
      }

      const result = await response.json();
      toast.success(result.message);
      
      // Recarregar funcionários para refletir as mudanças
      window.location.reload();
    } catch (error) {
      console.error('Erro ao desvincular funcionário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao desvincular funcionário');
    } finally {
      setUnlinkingLoading(null);
    }
  };

  const getContractName = (contractId: string | null) => {
    if (!contractId) return 'Não vinculado';
    const contract = contracts.find(c => c.id === contractId);
    return contract ? contract.name : 'Contrato não encontrado';
  };

  const getEmployeeCity = (employee: Employee) => {
    if (employee.address?.cidade) {
      return employee.address.cidade;
    }
    return 'Cidade não informada';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alocação de Efetivo</h1>
          <p className="text-muted-foreground">
            Gerencie a alocação de funcionários aos contratos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {availableEmployees.length} Disponíveis
          </Badge>
          <Badge variant="outline">
            {activeContracts.length} Contratos Ativos
          </Badge>
        </div>
      </div>

      {/* Seletor de Contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Selecionar Contrato
          </CardTitle>
          <CardDescription>
            Escolha o contrato para visualizar e gerenciar alocações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedContractId} onValueChange={setSelectedContractId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder={contractsLoading ? "Carregando..." : "Selecione um contrato"} />
            </SelectTrigger>
            <SelectContent>
              {activeContracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id}>
                  {contract.name} ({contract.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, CPF ou matrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}>
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funcionários Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Funcionários Disponíveis
              <Badge variant="secondary" className="ml-auto">
                {availableEmployees.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Funcionários não alocados em nenhum contrato
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employeesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando funcionários...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {availableEmployees.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedEmployeeIds.length === availableEmployees.length && availableEmployees.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm font-medium">Selecionar Todos</span>
                    </div>
                    {selectedEmployeeIds.length > 0 && selectedContractId && (
                      <Button 
                        onClick={handleLinkEmployees} 
                        size="sm"
                        disabled={linkingLoading}
                      >
                        {linkingLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4 mr-2" />
                        )}
                        Vincular ({selectedEmployeeIds.length})
                      </Button>
                    )}
                  </div>
                )}
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent"
                    >
                      <Checkbox
                        checked={selectedEmployeeIds.includes(employee.id)}
                        onCheckedChange={() => handleSelectEmployee(employee.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.registration || 'Sem matrícula'} • {employee.cpf}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getEmployeeCity(employee)} • {employee.admissionDate ? 
                            new Date(employee.admissionDate).toLocaleDateString('pt-BR') : 
                            'Data de admissão não informada'
                          }
                        </div>
                      </div>
                      <Badge variant={employee.isActive ? "default" : "secondary"}>
                        {employee.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  ))}
                  {availableEmployees.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Todos os funcionários já estão alocados em contratos</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funcionários Vinculados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Funcionários Vinculados
              <Badge variant="secondary" className="ml-auto">
                {linkedEmployees.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              {selectedContractId ? 
                'Funcionários alocados ao contrato selecionado' : 
                'Selecione um contrato para ver os funcionários vinculados'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employeesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando funcionários...</span>
              </div>
            ) : selectedContractId ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {linkedEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {employee.registration || 'Sem matrícula'} • {employee.cpf}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Vinculado em: {employee.contractAssignmentDate ? 
                          new Date(employee.contractAssignmentDate).toLocaleDateString('pt-BR') : 
                          'Data não informada'
                        }
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlinkEmployee(employee.id)}
                      disabled={unlinkingLoading === employee.id}
                    >
                      {unlinkingLoading === employee.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserX className="h-4 w-4 mr-2" />
                      )}
                      Desvincular
                    </Button>
                  </div>
                ))}
                {linkedEmployees.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum funcionário vinculado a este contrato</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um contrato para ver os funcionários vinculados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 