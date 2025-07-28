'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, Calculator, DollarSign, Percent, TrendingUp, Settings, FileText } from 'lucide-react';

interface BDICategory {
  id: string;
  name: string;
  description: string;
  percentage: number;
  base: 'CUSTO_DIRETO' | 'CUSTO_TOTAL' | 'CUSTO_INDIRETO';
  category: 'ADMINISTRATIVO' | 'COMERCIAL' | 'FINANCEIRO' | 'TRIBUTARIO' | 'RISCO' | 'LUCRO';
  isActive: boolean;
}

interface BDIConfig {
  id: string;
  name: string;
  description: string;
  totalBDI: number;
  categories: BDICategory[];
  isActive: boolean;
}

interface BDICalculatorProps {
  config?: BDIConfig;
  onSave: (config: Omit<BDIConfig, 'id'>) => void;
  loading?: boolean;
}

export default function BDICalculator({ config, onSave, loading = false }: BDICalculatorProps) {
  const [formData, setFormData] = useState({
    name: config?.name || '',
    description: config?.description || '',
    isActive: config?.isActive ?? true,
  });
  const [categories, setCategories] = useState<BDICategory[]>(config?.categories || []);

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name,
        description: config.description,
        isActive: config.isActive,
      });
      setCategories(config.categories);
    }
  }, [config]);

  const addCategory = () => {
    const newCategory: BDICategory = {
      id: `cat-${Date.now()}`,
      name: '',
      description: '',
      percentage: 0,
      base: 'CUSTO_DIRETO',
      category: 'ADMINISTRATIVO',
      isActive: true,
    };
    setCategories([...categories, newCategory]);
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  const updateCategory = (id: string, field: keyof BDICategory, value: any) => {
    const updatedCategories = categories.map(category => {
      if (category.id === id) {
        return { ...category, [field]: value };
      }
      return category;
    });
    setCategories(updatedCategories);
  };

  const handleSave = () => {
    if (!formData.name) {
      alert('Nome da configuração é obrigatório');
      return;
    }

    if (categories.length === 0) {
      alert('Adicione pelo menos uma categoria de BDI');
      return;
    }

    onSave({
      ...formData,
      categories,
      totalBDI: calculateTotalBDI(),
    });
  };

  const calculateTotalBDI = () => {
    return categories
      .filter(cat => cat.isActive)
      .reduce((total, cat) => total + cat.percentage, 0);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ADMINISTRATIVO':
        return 'bg-blue-100 text-blue-800';
      case 'COMERCIAL':
        return 'bg-green-100 text-green-800';
      case 'FINANCEIRO':
        return 'bg-purple-100 text-purple-800';
      case 'TRIBUTARIO':
        return 'bg-red-100 text-red-800';
      case 'RISCO':
        return 'bg-orange-100 text-orange-800';
      case 'LUCRO':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ADMINISTRATIVO':
        return <Settings className="w-4 h-4" />;
      case 'COMERCIAL':
        return <TrendingUp className="w-4 h-4" />;
      case 'FINANCEIRO':
        return <DollarSign className="w-4 h-4" />;
      case 'TRIBUTARIO':
        return <FileText className="w-4 h-4" />;
      case 'RISCO':
        return <Calculator className="w-4 h-4" />;
      case 'LUCRO':
        return <Percent className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const totalBDI = calculateTotalBDI();

  return (
    <div className="space-y-6">
      {/* Dados básicos */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Configuração de BDI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Nome da Configuração <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: BDI Padrão 2024"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descrição
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da configuração"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isActive" className="text-sm text-gray-700">
              Configuração ativa
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Resumo do BDI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Percent className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">BDI Total</p>
                <p className="text-2xl font-bold text-blue-900">{formatPercentage(totalBDI)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <Calculator className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Categorias Ativas</p>
                <p className="text-2xl font-bold text-green-900">
                  {categories.filter(cat => cat.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Fator Multiplicador</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(1 + totalBDI / 100).toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorias de BDI */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="w-5 h-5 text-green-600" />
              Categorias de BDI
            </CardTitle>
            <Button 
              onClick={addCategory} 
              size="sm"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Categoria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria definida</h3>
              <p className="text-gray-600 mb-6">
                Adicione categorias para compor o BDI
              </p>
              <Button 
                onClick={addCategory}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Categoria
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div key={category.id} className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-end p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Nome</Label>
                    <Input
                      value={category.name}
                      onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                      placeholder="Ex: Despesas Administrativas"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                    <Input
                      value={category.description}
                      onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                      placeholder="Descrição da categoria"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Percentual (%)</Label>
                    <Input
                      type="number"
                      value={category.percentage}
                      onChange={(e) => updateCategory(category.id, 'percentage', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      step="0.01"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Base de Cálculo</Label>
                    <select
                      value={category.base}
                      onChange={(e) => updateCategory(category.id, 'base', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="CUSTO_DIRETO">Custo Direto</option>
                      <option value="CUSTO_TOTAL">Custo Total</option>
                      <option value="CUSTO_INDIRETO">Custo Indireto</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Categoria</Label>
                    <select
                      value={category.category}
                      onChange={(e) => updateCategory(category.id, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ADMINISTRATIVO">Administrativo</option>
                      <option value="COMERCIAL">Comercial</option>
                      <option value="FINANCEIRO">Financeiro</option>
                      <option value="TRIBUTARIO">Tributário</option>
                      <option value="RISCO">Risco</option>
                      <option value="LUCRO">Lucro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={category.isActive}
                        onChange={(e) => updateCategory(category.id, 'isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Ativo</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 opacity-0">Ações</Label>
                    <Button
                      onClick={() => removeCategory(category.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo por categoria */}
      {categories.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Resumo por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['ADMINISTRATIVO', 'COMERCIAL', 'FINANCEIRO', 'TRIBUTARIO', 'RISCO', 'LUCRO'].map((catType) => {
                const categoryItems = categories.filter(cat => cat.category === catType && cat.isActive);
                const totalPercentage = categoryItems.reduce((sum, cat) => sum + cat.percentage, 0);
                
                if (categoryItems.length === 0) return null;

                return (
                  <Card key={catType} className="border-0 bg-gradient-to-r from-gray-50 to-white">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(catType)}`}>
                          {getCategoryIcon(catType)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{catType}</h4>
                          <p className="text-sm text-gray-600">{categoryItems.length} item(s)</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total:</span>
                          <span className="font-bold text-lg">{formatPercentage(totalPercentage)}</span>
                        </div>
                        {categoryItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 truncate">{item.name}</span>
                            <span className="font-medium">{formatPercentage(item.percentage)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão de salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Configuração BDI
        </Button>
      </div>
    </div>
  );
} 