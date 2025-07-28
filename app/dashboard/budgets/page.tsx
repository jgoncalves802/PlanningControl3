'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, FileText, Calculator, DollarSign, Edit, Calendar, User, Building, TrendingUp } from 'lucide-react';
import BudgetCreateModal from '@/components/budgets/BudgetCreateModal';
import BudgetStats from '@/components/budgets/BudgetStats';
import BudgetDashboard from '@/components/budgets/BudgetDashboard';
import { useBudgets } from '@/lib/hooks/useBudgets';
import { Budget, BudgetStatus } from '@/lib/types/budgets';

export default function BudgetsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { budgets, pagination, isLoading, error } = useBudgets(currentPage, search, statusFilter);

  const filteredBudgets = budgets || [];
  const totalPages = pagination?.pages || 1;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: BudgetStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: BudgetStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'Rascunho';
      case 'IN_REVIEW':
        return 'Em Revisão';
      case 'APPROVED':
        return 'Aprovado';
      case 'REJECTED':
        return 'Rejeitado';
      default:
        return 'Desconhecido';
    }
  };

  const getProjectTypeIcon = (projectType: string) => {
    switch (projectType?.toLowerCase()) {
      case 'construcao':
        return <Building className="w-4 h-4" />;
      case 'reforma':
        return <Calculator className="w-4 h-4" />;
      case 'manutencao':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Erro ao carregar orçamentos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            Orçamentos
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie e acompanhe todos os orçamentos do projeto
          </p>
        </div>
        <BudgetCreateModal onBudgetCreated={() => setShowCreateModal(false)} />
      </div>

      {/* Estatísticas */}
      <BudgetStats budgets={filteredBudgets} />

      {/* Dashboard de Métricas */}
      <div className="mb-8">
        <BudgetDashboard budgets={filteredBudgets} />
      </div>

      {/* Filtros e Busca */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-50 to-white">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar orçamentos por nome, código ou cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="IN_REVIEW">Em Revisão</SelectItem>
                  <SelectItem value="APPROVED">Aprovado</SelectItem>
                  <SelectItem value="REJECTED">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Orçamentos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBudgets.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento encontrado</h3>
            <p className="text-gray-600 mb-6">
              {search || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece criando seu primeiro orçamento'
              }
            </p>
            {!search && statusFilter === 'all' && (
              <BudgetCreateModal onBudgetCreated={() => setShowCreateModal(false)} />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget: Budget) => (
            <Card key={budget.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getProjectTypeIcon(budget.projectType || '')}
                      <Badge className={`text-xs font-medium ${getStatusColor(budget.status)}`}>
                        {getStatusLabel(budget.status)}
                      </Badge>
                    </div>
                    <Link href={`/dashboard/budgets/${budget.id}`}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Informações Principais */}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                      {budget.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-mono">
                      {budget.code}
                    </p>
                  </div>

                  {/* Descrição */}
                  {budget.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {budget.description}
                    </p>
                  )}

                  {/* Informações Adicionais */}
                  <div className="space-y-2">
                    {budget.clientName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{budget.clientName}</span>
                      </div>
                    )}
                    
                    {budget.projectType && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="capitalize">{budget.projectType}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Criado em {formatDate(budget.createdAt)}</span>
                    </div>
                  </div>

                  {/* Valor (se disponível) */}
                  {budget.totalValue && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Valor Total:</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(budget.totalValue)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botão de Ação */}
                  <div className="pt-2">
                    <Link href={`/dashboard/budgets/${budget.id}`} className="w-full">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Orçamento
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 