'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, FileText, Calendar, User, Building, Hash, Download, Eye, Clock, MapPin, Phone, Mail, DollarSign } from 'lucide-react';

interface ServiceOrderItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  completed: boolean;
  notes: string;
}

interface ServiceOrder {
  id: string;
  number: string;
  title: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  items: ServiceOrderItem[];
  notes: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceOrderGeneratorProps {
  budget?: any; // Tipo do orçamento
  onSave: (serviceOrder: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onExport?: (serviceOrder: ServiceOrder) => void;
  loading?: boolean;
}

export default function ServiceOrderGenerator({ 
  budget, 
  onSave, 
  onExport, 
  loading = false 
}: ServiceOrderGeneratorProps) {
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    startDate: '',
    endDate: '',
    notes: '',
    status: 'PENDING' as const,
  });
  const [items, setItems] = useState<ServiceOrderItem[]>([]);

  useEffect(() => {
    if (budget) {
      // Preencher dados do orçamento
      setFormData({
        number: `OS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        title: `Ordem de Serviço - ${budget.name}`,
        clientName: budget.clientName || '',
        clientAddress: '',
        clientPhone: '',
        clientEmail: '',
        startDate: '',
        endDate: '',
        notes: '',
        status: 'PENDING',
      });

      // Converter itens do orçamento para itens da OS
      if (budget.sections) {
        const budgetItems: ServiceOrderItem[] = [];
        budget.sections.forEach((section: any) => {
          if (section.items) {
            section.items.forEach((item: any) => {
              budgetItems.push({
                id: `item-${Date.now()}-${Math.random()}`,
                description: item.description || item.name,
                quantity: item.quantity || 1,
                unit: item.unit || 'un',
                unitPrice: item.unitPrice || 0,
                totalPrice: item.totalPrice || 0,
                completed: false,
                notes: '',
              });
            });
          }
        });
        setItems(budgetItems);
      }
    }
  }, [budget]);

  const updateItem = (id: string, field: keyof ServiceOrderItem, value: any) => {
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

  const handleSave = () => {
    if (!formData.number) {
      alert('Número da OS é obrigatório');
      return;
    }

    if (!formData.title) {
      alert('Título da OS é obrigatório');
      return;
    }

    if (!formData.clientName) {
      alert('Nome do cliente é obrigatório');
      return;
    }

    onSave({
      ...formData,
      items,
      totalValue: calculateTotalValue(),
    });
  };

  const calculateTotalValue = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const totalValue = calculateTotalValue();
  const completedItems = items.filter(item => item.completed).length;
  const progressPercentage = items.length > 0 ? (completedItems / items.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Dados básicos da OS */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-blue-600" />
            Dados da Ordem de Serviço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Número da OS <span className="text-red-500">*</span>
              </Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="Ex: OS-2024-001"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título da ordem de serviço"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                Data de Início
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                Data de Conclusão Prevista
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PENDING">Pendente</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="COMPLETED">Concluída</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Dados do cliente */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="w-5 h-5 text-green-600" />
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="clientPhone" className="text-sm font-medium text-gray-700">
                Telefone
              </Label>
              <Input
                id="clientPhone"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail" className="text-sm font-medium text-gray-700">
              E-mail
            </Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              placeholder="cliente@email.com"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientAddress" className="text-sm font-medium text-gray-700">
              Endereço
            </Label>
            <Textarea
              id="clientAddress"
              value={formData.clientAddress}
              onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
              placeholder="Endereço completo do cliente"
              className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumo da OS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Hash className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Número da OS</p>
                <p className="text-lg font-bold text-blue-900">{formData.number}</p>
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
                <p className="text-sm text-green-700 font-medium">Valor Total</p>
                <p className="text-lg font-bold text-green-900">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <Clock className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Progresso</p>
                <p className="text-lg font-bold text-purple-900">{progressPercentage.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-200 rounded-lg">
                <FileText className="w-5 h-5 text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-orange-700 font-medium">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(formData.status)}`}>
                  {getStatusLabel(formData.status)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itens da OS */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building className="w-5 h-5 text-purple-600" />
            Itens da Ordem de Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item definido</h3>
              <p className="text-gray-600">
                Os itens serão carregados automaticamente do orçamento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-8 gap-4 items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
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
                    <Label className="text-sm font-medium text-gray-700">Qtd.</Label>
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
                    <Label className="text-sm font-medium text-gray-700">Concluído</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => updateItem(item.id, 'completed', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Sim</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Observações</Label>
                    <Input
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                      placeholder="Observações"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 opacity-0">Status</Label>
                    <div className={`w-3 h-3 rounded-full ${item.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-orange-600" />
            Observações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Observações Gerais
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais sobre a ordem de serviço..."
              className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onExport && (
            <Button
              onClick={() => onExport({} as ServiceOrder)}
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
          Salvar Ordem de Serviço
        </Button>
      </div>
    </div>
  );
} 