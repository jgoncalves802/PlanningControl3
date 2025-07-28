'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, DollarSign, Calendar, Percent, FileText, Upload, Download, Eye, Edit } from 'lucide-react';

interface CommercialItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
  isActive: boolean;
}

interface CommercialCondition {
  id: string;
  title: string;
  description: string;
  type: 'PAYMENT' | 'DELIVERY' | 'WARRANTY' | 'OTHER';
  isActive: boolean;
}

interface CommercialProposal {
  id: string;
  title: string;
  clientName: string;
  validityDays: number;
  totalValue: number;
  discount: number;
  finalValue: number;
  items: CommercialItem[];
  conditions: CommercialCondition[];
  notes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CommercialProposalEditorProps {
  proposal?: CommercialProposal;
  onSave: (proposal: Omit<CommercialProposal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onExport?: (proposal: CommercialProposal) => void;
  loading?: boolean;
}

export default function CommercialProposalEditor({ 
  proposal, 
  onSave, 
  onExport, 
  loading = false 
}: CommercialProposalEditorProps) {
  const [formData, setFormData] = useState({
    title: proposal?.title || '',
    clientName: proposal?.clientName || '',
    validityDays: proposal?.validityDays || 30,
    discount: proposal?.discount || 0,
    notes: proposal?.notes || '',
    isActive: proposal?.isActive ?? true,
  });
  const [items, setItems] = useState<CommercialItem[]>(proposal?.items || []);
  const [conditions, setConditions] = useState<CommercialCondition[]>(proposal?.conditions || []);

  useEffect(() => {
    if (proposal) {
      setFormData({
        title: proposal.title,
        clientName: proposal.clientName,
        validityDays: proposal.validityDays,
        discount: proposal.discount,
        notes: proposal.notes,
        isActive: proposal.isActive,
      });
      setItems(proposal.items);
      setConditions(proposal.conditions);
    }
  }, [proposal]);

  const addItem = () => {
    const newItem: CommercialItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unit: 'un',
      unitPrice: 0,
      totalPrice: 0,
      category: '',
      isActive: true,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof CommercialItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalcular preço total
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const addCondition = () => {
    const newCondition: CommercialCondition = {
      id: `cond-${Date.now()}`,
      title: '',
      description: '',
      type: 'PAYMENT',
      isActive: true,
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition.id !== id));
  };

  const updateCondition = (id: string, field: keyof CommercialCondition, value: any) => {
    const updatedConditions = conditions.map(condition => {
      if (condition.id === id) {
        return { ...condition, [field]: value };
      }
      return condition;
    });
    setConditions(updatedConditions);
  };

  const handleSave = () => {
    if (!formData.title) {
      alert('Título da proposta é obrigatório');
      return;
    }

    if (!formData.clientName) {
      alert('Nome do cliente é obrigatório');
      return;
    }

    onSave({
      ...formData,
      items,
      conditions,
      totalValue: calculateTotalValue(),
      finalValue: calculateFinalValue(),
    });
  };

  const calculateTotalValue = () => {
    return items
      .filter(item => item.isActive)
      .reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateFinalValue = () => {
    const totalValue = calculateTotalValue();
    const discountAmount = (totalValue * formData.discount) / 100;
    return totalValue - discountAmount;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getConditionTypeLabel = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return 'Pagamento';
      case 'DELIVERY':
        return 'Entrega';
      case 'WARRANTY':
        return 'Garantia';
      case 'OTHER':
        return 'Outros';
      default:
        return type;
    }
  };

  const getConditionTypeColor = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return 'bg-green-100 text-green-800';
      case 'DELIVERY':
        return 'bg-blue-100 text-blue-800';
      case 'WARRANTY':
        return 'bg-orange-100 text-orange-800';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalValue = calculateTotalValue();
  const finalValue = calculateFinalValue();
  const discountAmount = (totalValue * formData.discount) / 100;

  return (
    <div className="space-y-6">
      {/* Dados básicos da proposta */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Dados da Proposta Comercial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Título da Proposta <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Proposta Comercial - Construção Residencial"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Nome do Cliente <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Nome completo do cliente"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validityDays" className="text-sm font-medium text-gray-700">
                Validade (dias)
              </Label>
              <Input
                id="validityDays"
                type="number"
                value={formData.validityDays}
                onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 0 })}
                placeholder="30"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount" className="text-sm font-medium text-gray-700">
                Desconto (%)
              </Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Observações
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais sobre a proposta..."
              className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              rows={3}
            />
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
              Proposta ativa
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Valor Total</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-200 rounded-lg">
                <Percent className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-red-700 font-medium">Desconto</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(discountAmount)}</p>
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
                <p className="text-sm text-green-700 font-medium">Valor Final</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(finalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Validade</p>
                <p className="text-2xl font-bold text-purple-900">{formData.validityDays} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itens da proposta */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="w-5 h-5 text-green-600" />
              Itens da Proposta
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
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item definido</h3>
              <p className="text-gray-600 mb-6">
                Adicione itens para compor sua proposta comercial
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
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-end p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Descrição do item"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Quantidade</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="1"
                      step="0.01"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Unidade</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      placeholder="un"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Preço Unit.</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      step="0.01"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Preço Total</Label>
                    <Input
                      value={formatCurrency(item.totalPrice)}
                      readOnly
                      className="border-gray-300 bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Categoria</Label>
                    <Input
                      value={item.category}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                      placeholder="Categoria"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
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

      {/* Condições comerciais */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-purple-600" />
              Condições Comerciais
            </CardTitle>
            <Button 
              onClick={addCondition} 
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Condição
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {conditions.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma condição definida</h3>
              <p className="text-gray-600 mb-6">
                Adicione condições comerciais para sua proposta
              </p>
              <Button 
                onClick={addCondition}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Condição
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {conditions.map((condition) => (
                <div key={condition.id} className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Título</Label>
                    <Input
                      value={condition.title}
                      onChange={(e) => updateCondition(condition.id, 'title', e.target.value)}
                      placeholder="Título da condição"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                    <Input
                      value={condition.description}
                      onChange={(e) => updateCondition(condition.id, 'description', e.target.value)}
                      placeholder="Descrição da condição"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Tipo</Label>
                    <select
                      value={condition.type}
                      onChange={(e) => updateCondition(condition.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PAYMENT">Pagamento</option>
                      <option value="DELIVERY">Entrega</option>
                      <option value="WARRANTY">Garantia</option>
                      <option value="OTHER">Outros</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={condition.isActive}
                        onChange={(e) => updateCondition(condition.id, 'isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Ativo</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 opacity-0">Ações</Label>
                    <Button
                      onClick={() => removeCondition(condition.id)}
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

      {/* Botões de ação */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {proposal && onExport && (
            <Button
              onClick={() => onExport(proposal)}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          )}
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Proposta Comercial
        </Button>
      </div>
    </div>
  );
} 