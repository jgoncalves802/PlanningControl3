'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, FileText, Calculator, DollarSign, Settings, User, Building, Calendar, Hash, TrendingUp, Code, Shield } from 'lucide-react';
import { useBudget, updateBudget } from '@/lib/hooks/useBudgets';
import QQPSpreadsheet from '@/components/budgets/QQPSpreadsheet';
import CompositionEditor from '@/components/budgets/CompositionEditor';
import FormulaEditor from '@/components/budgets/FormulaEditor';
import BDICalculator from '@/components/budgets/BDICalculator';
import ChargesCalculator from '@/components/budgets/ChargesCalculator';
import TechnicalProposalEditor from '@/components/budgets/TechnicalProposalEditor';
import CommercialProposalEditor from '@/components/budgets/CommercialProposalEditor';
import ServiceOrderGenerator from '@/components/budgets/ServiceOrderGenerator';
import { Budget, SectionType } from '@/lib/types/budgets';

export default function BudgetEditPage() {
  const params = useParams();
  const router = useRouter();
  const budgetId = params.id as string;
  
  const { budget, isLoading, error, refresh } = useBudget(budgetId);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('qqp');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    projectType: '',
  });

  const [qqpItems, setQqpItems] = useState<any[]>([]);
  const [compositions, setCompositions] = useState<any[]>([]);

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        description: budget.description || '',
        clientName: budget.clientName || '',
        projectType: budget.projectType || '',
      });

      // Carregar dados das seções
      const qqpSection = budget.sections?.find(s => s.type === 'QQP');
      if (qqpSection) {
        setQqpItems(qqpSection.items || []);
      }

      const compositionSection = budget.sections?.find(s => s.type === 'CPU');
      if (compositionSection) {
        setCompositions(compositionSection.items || []);
      }
    }
  }, [budget]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Atualizar dados básicos
      await updateBudget(budgetId, formData);
      
      refresh();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleQQPChange = (items: any[]) => {
    setQqpItems(items);
  };

  const handleCompositionSave = (composition: any) => {
    setCompositions([...compositions, composition]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar orçamento</h3>
          <p className="text-gray-600 mb-6">Não foi possível carregar os dados do orçamento</p>
          <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button onClick={() => router.back()} variant="outline" className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{budget.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="font-mono text-sm bg-blue-100 text-blue-800">
                      {budget.code}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(budget.status)}`}>
                      {getStatusLabel(budget.status)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Informações rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{budget.clientName || 'Cliente não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="capitalize">{budget.projectType || 'Tipo não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Criado em {formatDate(budget.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dados básicos */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Hash className="w-5 h-5 text-gray-500" />
            Dados Básicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nome do Orçamento
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-medium text-gray-700">
                Cliente
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectType" className="text-sm font-medium text-gray-700">
              Tipo de Projeto
            </Label>
            <Input
              id="projectType"
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes seções */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-7 h-14 bg-transparent">
                <TabsTrigger 
                  value="qqp" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  <FileText className="w-4 h-4" />
                  QQP
                </TabsTrigger>
                <TabsTrigger 
                  value="compositions" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  <Calculator className="w-4 h-4" />
                  Composições
                </TabsTrigger>
                <TabsTrigger 
                  value="formulas" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  <Code className="w-4 h-4" />
                  Fórmulas
                </TabsTrigger>
                <TabsTrigger 
                  value="charges" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  <Shield className="w-4 h-4" />
                  Encargos
                </TabsTrigger>
                <TabsTrigger 
                  value="bdi" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  <DollarSign className="w-4 h-4" />
                  BDI
                </TabsTrigger>
                <TabsTrigger 
                  value="proposals" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  <FileText className="w-4 h-4" />
                  Propostas
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="qqp" className="mt-0">
                <QQPSpreadsheet
                  items={qqpItems}
                  onItemsChange={handleQQPChange}
                  onSave={handleSave}
                  loading={saving}
                />
              </TabsContent>

              <TabsContent value="compositions" className="mt-0">
                <CompositionEditor
                  onSave={handleCompositionSave}
                  loading={saving}
                />
              </TabsContent>

              <TabsContent value="formulas" className="mt-0">
                <FormulaEditor
                  onSave={handleSave}
                  loading={saving}
                />
              </TabsContent>

              <TabsContent value="charges" className="mt-0">
                <ChargesCalculator
                  onSave={handleSave}
                  loading={saving}
                />
              </TabsContent>

              <TabsContent value="bdi" className="mt-0">
                <BDICalculator
                  onSave={handleSave}
                  loading={saving}
                />
              </TabsContent>

              <TabsContent value="proposals" className="mt-0">
                <div className="space-y-6">
                  {/* Proposta Técnica */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Proposta Técnica
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TechnicalProposalEditor
                        onSave={handleSave}
                        loading={saving}
                      />
                    </CardContent>
                  </Card>

                  {/* Proposta Comercial */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Proposta Comercial
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CommercialProposalEditor
                        onSave={handleSave}
                        loading={saving}
                      />
                    </CardContent>
                  </Card>

                  {/* Ordem de Serviço */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Ordem de Serviço
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ServiceOrderGenerator
                        budget={budget}
                        onSave={handleSave}
                        loading={saving}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <Card className="border-0 bg-gradient-to-r from-gray-50 to-blue-50">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Settings className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações do Orçamento</h3>
                    <p className="text-gray-600 mb-4">
                      Configure parâmetros avançados, fórmulas e regras de negócio.
                    </p>
                    <p className="text-sm text-gray-500">
                      Esta funcionalidade será implementada na próxima fase.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 