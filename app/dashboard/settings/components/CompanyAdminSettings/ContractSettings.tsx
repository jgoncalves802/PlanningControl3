'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Trash2, FileText, Users, Building, Settings, Loader2, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Contract {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  workdayHours: number;
  includesWeekends: boolean;
  includesHolidays: boolean;
  employeeCount: number;
  functionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CompanyFunction {
  id: string;
  name: string;
  laborType: 'DIRECT' | 'INDIRECT';
  isActive: boolean;
  employeeCount: number;
  requiredTrainings: string[];
  createdAt: string;
}

interface CostCenter {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  budget: number;
  spent: number;
  employeeCount: number;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  employeeCount: number;
  createdAt: string;
}

export default function ContractSettings() {
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: '1',
      name: 'Contrato Principal',
      code: 'CTR-001',
      isActive: true,
      workdayHours: 8,
      includesWeekends: false,
      includesHolidays: false,
      employeeCount: 15,
      functionCount: 8,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-07-28T15:30:00Z'
    },
    {
      id: '2',
      name: 'Contrato de Manutenção',
      code: 'CTR-002',
      isActive: true,
      workdayHours: 6,
      includesWeekends: true,
      includesHolidays: true,
      employeeCount: 8,
      functionCount: 4,
      createdAt: '2025-02-20T09:00:00Z',
      updatedAt: '2025-07-28T14:20:00Z'
    }
  ]);

  const [functions, setFunctions] = useState<CompanyFunction[]>([
    {
      id: '1',
      name: 'Operador de Máquina',
      laborType: 'DIRECT',
      isActive: true,
      employeeCount: 5,
      requiredTrainings: ['NR-12', 'Segurança do Trabalho'],
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Técnico de Manutenção',
      laborType: 'DIRECT',
      isActive: true,
      employeeCount: 3,
      requiredTrainings: ['NR-12', 'Eletricidade Básica'],
      createdAt: '2025-01-20T11:00:00Z'
    },
    {
      id: '3',
      name: 'Auxiliar Administrativo',
      laborType: 'INDIRECT',
      isActive: true,
      employeeCount: 2,
      requiredTrainings: ['Office Básico'],
      createdAt: '2025-02-01T09:00:00Z'
    }
  ]);

  const [costCenters, setCostCenters] = useState<CostCenter[]>([
    {
      id: '1',
      name: 'Centro de Custo Principal',
      code: 'CC-001',
      isActive: true,
      budget: 500000,
      spent: 320000,
      employeeCount: 12,
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Centro de Custo Manutenção',
      code: 'CC-002',
      isActive: true,
      budget: 200000,
      spent: 150000,
      employeeCount: 6,
      createdAt: '2025-02-01T09:00:00Z'
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Projeto de Expansão',
      code: 'PRJ-001',
      status: 'ACTIVE',
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-12-31T23:59:59Z',
      budget: 1000000,
      spent: 650000,
      employeeCount: 8,
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Manutenção Preventiva',
      code: 'PRJ-002',
      status: 'ACTIVE',
      startDate: '2025-03-01T00:00:00Z',
      budget: 300000,
      spent: 180000,
      employeeCount: 4,
      createdAt: '2025-03-01T00:00:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'PAUSED':
        return 'secondary';
      case 'COMPLETED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getLaborTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'DIRECT':
        return 'default';
      case 'INDIRECT':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleCreateContract = async (contractData: Partial<Contract>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newContract: Contract = {
        id: Date.now().toString(),
        name: contractData.name || '',
        code: contractData.code || '',
        isActive: true,
        workdayHours: contractData.workdayHours || 8,
        includesWeekends: contractData.includesWeekends || false,
        includesHolidays: contractData.includesHolidays || false,
        employeeCount: 0,
        functionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setContracts(prev => [newContract, ...prev]);
      setIsCreateDialogOpen(false);
      toast.success('Contrato criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar contrato');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleContractStatus = (contractId: string) => {
    setContracts(prev => prev.map(contract =>
      contract.id === contractId ? { ...contract, isActive: !contract.isActive } : contract
    ));
    toast.success('Status do contrato atualizado');
  };

  const handleDeleteContract = (contractId: string) => {
    if (confirm('Tem certeza que deseja excluir este contrato?')) {
      setContracts(prev => prev.filter(contract => contract.id !== contractId));
      toast.success('Contrato excluído com sucesso');
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Tabs defaultValue="contracts" className="space-y-6">
      <TabsList>
        <TabsTrigger value="contracts" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Contratos
        </TabsTrigger>
        <TabsTrigger value="functions" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Funções
        </TabsTrigger>
        <TabsTrigger value="cost-centers" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Centros de Custo
        </TabsTrigger>
        <TabsTrigger value="projects" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Projetos
        </TabsTrigger>
      </TabsList>

      {/* Aba de Contratos */}
      <TabsContent value="contracts" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Gerenciamento de Contratos
                </CardTitle>
                <CardDescription>
                  Gerencie os contratos da empresa e suas configurações
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Contrato
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Contrato</DialogTitle>
                    <DialogDescription>
                      Configure um novo contrato para a empresa
                    </DialogDescription>
                  </DialogHeader>
                  <CreateContractForm onSubmit={handleCreateContract} isLoading={isLoading} />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtro de busca */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar contratos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lista de contratos */}
            <div className="space-y-4">
              {filteredContracts.map(contract => (
                <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{contract.name}</h3>
                        <Badge variant="outline">{contract.code}</Badge>
                        <Badge variant={contract.isActive ? 'default' : 'secondary'}>
                          {contract.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {contract.workdayHours}h/dia • {contract.employeeCount} funcionários • {contract.functionCount} funções
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contract.includesWeekends ? 'Inclui fins de semana' : 'Não inclui fins de semana'} • 
                        {contract.includesHolidays ? ' Inclui feriados' : ' Não inclui feriados'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Criado em: {new Date(contract.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleContractStatus(contract.id)}
                    >
                      {contract.isActive ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteContract(contract.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredContracts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum contrato encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba de Funções */}
      <TabsContent value="functions">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Funções e Cargos
            </CardTitle>
            <CardDescription>
              Gerencie as funções e cargos disponíveis na empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {functions.map(func => (
                <div key={func.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{func.name}</h3>
                    <Badge variant={getLaborTypeBadgeVariant(func.laborType)}>
                      {func.laborType === 'DIRECT' ? 'Direto' : 'Indireto'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {func.employeeCount} funcionários
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Treinamentos obrigatórios:</p>
                    <div className="flex flex-wrap gap-1">
                      {func.requiredTrainings.map((training, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {training}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba de Centros de Custo */}
      <TabsContent value="cost-centers">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Centros de Custo
            </CardTitle>
            <CardDescription>
              Gerencie os centros de custo da empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {costCenters.map(center => (
                <div key={center.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{center.name}</h3>
                    <Badge variant="outline">{center.code}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {center.employeeCount} funcionários
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Orçamento:</span>
                      <span className="font-medium">R$ {center.budget.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Gasto:</span>
                      <span className="font-medium">R$ {center.spent.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(center.spent / center.budget) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba de Projetos */}
      <TabsContent value="projects">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Projetos e Obras
            </CardTitle>
            <CardDescription>
              Gerencie os projetos e obras da empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{project.name}</h3>
                      <Badge variant="outline">{project.code}</Badge>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status === 'ACTIVE' ? 'Ativo' : 
                         project.status === 'PAUSED' ? 'Pausado' : 'Concluído'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {project.employeeCount} funcionários • 
                    {new Date(project.startDate).toLocaleDateString('pt-BR')} - 
                    {project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'Em andamento'}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Orçamento</p>
                      <p className="text-lg">R$ {project.budget.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Gasto</p>
                      <p className="text-lg">R$ {project.spent.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(project.spent / project.budget) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// Componente para formulário de criação de contrato
function CreateContractForm({ onSubmit, isLoading }: { onSubmit: (data: Partial<Contract>) => void, isLoading: boolean }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    workdayHours: 8,
    includesWeekends: false,
    includesHolidays: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Contrato *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Digite o nome do contrato"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">Código do Contrato *</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          placeholder="CTR-001"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="workdayHours">Horas de Trabalho por Dia</Label>
        <Input
          id="workdayHours"
          type="number"
          min="1"
          max="24"
          value={formData.workdayHours}
          onChange={(e) => setFormData(prev => ({ ...prev, workdayHours: parseInt(e.target.value) }))}
          placeholder="8"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="includesWeekends"
          checked={formData.includesWeekends}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includesWeekends: checked }))}
        />
        <Label htmlFor="includesWeekends">Inclui fins de semana</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="includesHolidays"
          checked={formData.includesHolidays}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includesHolidays: checked }))}
        />
        <Label htmlFor="includesHolidays">Inclui feriados</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Criando...
            </>
          ) : (
            'Criar Contrato'
          )}
        </Button>
      </div>
    </form>
  );
} 