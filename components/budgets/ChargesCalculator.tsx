'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, Calculator, DollarSign, Percent, Shield, Users, TrendingUp } from 'lucide-react';

interface ChargeItem {
  id: string;
  name: string;
  description: string;
  percentage: number;
  base: 'SALARIO' | 'SALARIO_BRUTO' | 'SALARIO_LIQUIDO' | 'CUSTO_TOTAL';
  category: 'PREVIDENCIARIO' | 'TRABALHISTA' | 'FISCAL' | 'OUTROS';
  isActive: boolean;
  employerCost: boolean;
  employeeCost: boolean;
}

interface ChargesConfig {
  id: string;
  name: string;
  description: string;
  totalCharges: number;
  employerCharges: number;
  employeeCharges: number;
  items: ChargeItem[];
  isActive: boolean;
}

interface ChargesCalculatorProps {
  config?: ChargesConfig;
  onSave: (config: Omit<ChargesConfig, 'id'>) => void;
  loading?: boolean;
}

export default function ChargesCalculator({ config, onSave, loading = false }: ChargesCalculatorProps) {
  const [formData, setFormData] = useState({
    name: config?.name || '',
    description: config?.description || '',
    isActive: config?.isActive ?? true,
  });
  const [items, setItems] = useState<ChargeItem[]>(config?.items || []);

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name,
        description: config.description,
        isActive: config.isActive,
      });
      setItems(config.items);
    }
  }, [config]);

  const addItem = () => {
    const newItem: ChargeItem = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      percentage: 0,
      base: 'SALARIO',
      category: 'PREVIDENCIARIO',
      isActive: true,
      employerCost: true,
      employeeCost: false,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ChargeItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleSave = () => {
    if (!formData.name) {
      alert('Nome da configuração é obrigatório');
      return;
    }

    if (items.length === 0) {
      alert('Adicione pelo menos um item de encargo');
      return;
    }

    onSave({
      ...formData,
      items,
      totalCharges: calculateTotalCharges(),
      employerCharges: calculateEmployerCharges(),
      employeeCharges: calculateEmployeeCharges(),
    });
  };

  const calculateTotalCharges = () => {
    return items
      .filter(item => item.isActive)
      .reduce((total, item) => total + item.percentage, 0);
  };

  const calculateEmployerCharges = () => {
    return items
      .filter(item => item.isActive && item.employerCost)
      .reduce((total, item) => total + item.percentage, 0);
  };

  const calculateEmployeeCharges = () => {
    return items
      .filter(item => item.isActive && item.employeeCost)
      .reduce((total, item) => total + item.percentage, 0);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PREVIDENCIARIO':
        return 'bg-blue-100 text-blue-800';
      case 'TRABALHISTA':
        return 'bg-green-100 text-green-800';
      case 'FISCAL':
        return 'bg-red-100 text-red-800';
      case 'OUTROS':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PREVIDENCIARIO':
        return <Shield className="w-4 h-4" />;
      case 'TRABALHISTA':
        return <Users className="w-4 h-4" />;
      case 'FISCAL':
        return <DollarSign className="w-4 h-4" />;
      case 'OUTROS':
        return <Calculator className="w-4 h-4" />;
      default:
        return <Calculator className="w-4 h-4" />;
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const totalCharges = calculateTotalCharges();
  const employerCharges = calculateEmployerCharges();
  const employeeCharges = calculateEmployeeCharges();

  return (
    <div className="space-y-6">
      {/* Dados básicos */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-5 h-5 text-blue-600" />
            Configuração de Encargos
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
                placeholder="Ex: Encargos Padrão 2024"
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

      {/* Resumo dos encargos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Percent className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Total de Encargos</p>
                <p className="text-2xl font-bold text-blue-900">{formatPercentage(totalCharges)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Encargos Patronais</p>
                <p className="text-2xl font-bold text-green-900">{formatPercentage(employerCharges)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <Users className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Encargos do Funcionário</p>
                <p className="text-2xl font-bold text-purple-900">{formatPercentage(employeeCharges)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-orange-700 font-medium">Fator de Encargos</p>
                <p className="text-2xl font-bold text-orange-900">
                  {(1 + employerCharges / 100).toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itens de encargos */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="w-5 h-5 text-green-600" />
              Itens de Encargos
            </CardTitle>
            <Button 
              onClick={addItem} 
              size="sm"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item de encargo definido</h3>
              <p className="text-gray-600 mb-6">
                Adicione itens para compor os encargos
              </p>
              <Button 
                onClick={addItem}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-8 gap-4 items-end p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Nome</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder="Ex: INSS Patronal"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Descrição do encargo"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Percentual (%)</Label>
                    <Input
                      type="number"
                      value={item.percentage}
                      onChange={(e) => updateItem(item.id, 'percentage', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      step="0.01"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Base de Cálculo</Label>
                    <select
                      value={item.base}
                      onChange={(e) => updateItem(item.id, 'base', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="SALARIO">Salário</option>
                      <option value="SALARIO_BRUTO">Salário Bruto</option>
                      <option value="SALARIO_LIQUIDO">Salário Líquido</option>
                      <option value="CUSTO_TOTAL">Custo Total</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Categoria</Label>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PREVIDENCIARIO">Previdenciário</option>
                      <option value="TRABALHISTA">Trabalhista</option>
                      <option value="FISCAL">Fiscal</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Responsável</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.employerCost}
                          onChange={(e) => updateItem(item.id, 'employerCost', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">Patrão</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.employeeCost}
                          onChange={(e) => updateItem(item.id, 'employeeCost', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">Funcionário</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(e) => updateItem(item.id, 'isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Ativo</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 opacity-0">Ações</Label>
                    <Button
                      onClick={() => removeItem(item.id)}
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
      {items.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Resumo por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['PREVIDENCIARIO', 'TRABALHISTA', 'FISCAL', 'OUTROS'].map((catType) => {
                const categoryItems = items.filter(item => item.category === catType && item.isActive);
                const totalPercentage = categoryItems.reduce((sum, item) => sum + item.percentage, 0);
                const employerPercentage = categoryItems
                  .filter(item => item.employerCost)
                  .reduce((sum, item) => sum + item.percentage, 0);
                const employeePercentage = categoryItems
                  .filter(item => item.employeeCost)
                  .reduce((sum, item) => sum + item.percentage, 0);
                
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
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Patrão:</span>
                          <span className="font-medium text-green-600">{formatPercentage(employerPercentage)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Funcionário:</span>
                          <span className="font-medium text-purple-600">{formatPercentage(employeePercentage)}</span>
                        </div>
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
          Salvar Configuração de Encargos
        </Button>
      </div>
    </div>
  );
} 