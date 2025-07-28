'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, Calculator, TrendingUp, Hash, Package, DollarSign } from 'lucide-react';

interface QQPItem {
  id: string;
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

interface QQPSpreadsheetProps {
  items: QQPItem[];
  onItemsChange: (items: QQPItem[]) => void;
  onSave: () => void;
  loading?: boolean;
}

export default function QQPSpreadsheet({ items, onItemsChange, onSave, loading = false }: QQPSpreadsheetProps) {
  const [localItems, setLocalItems] = useState<QQPItem[]>(items);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const addItem = () => {
    const newItem: QQPItem = {
      id: `item-${Date.now()}`,
      code: '',
      description: '',
      unit: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      category: '',
    };
    const updatedItems = [...localItems, newItem];
    setLocalItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const removeItem = (id: string) => {
    const updatedItems = localItems.filter(item => item.id !== id);
    setLocalItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const updateItem = (id: string, field: keyof QQPItem, value: any) => {
    const updatedItems = localItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calcular preço total automaticamente
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setLocalItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const calculateTotals = () => {
    const totals = localItems.reduce(
      (acc, item) => {
        acc.totalQuantity += item.quantity;
        acc.totalValue += item.totalPrice;
        return acc;
      },
      { totalQuantity: 0, totalValue: 0 }
    );
    return totals;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Hash className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Total de Itens</p>
                <p className="text-2xl font-bold text-blue-900">{localItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <Package className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Quantidade Total</p>
                <p className="text-2xl font-bold text-green-900">{totals.totalQuantity.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Valor Total</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(totals.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Planilha */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="w-5 h-5 text-blue-600" />
              QQP - Quantidades e Preços
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={addItem} 
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Item
              </Button>
              <Button 
                onClick={onSave} 
                disabled={loading} 
                size="sm"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                <Save className="w-4 h-4 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {localItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item adicionado</h3>
              <p className="text-gray-600 mb-6">
                Comece adicionando itens à sua planilha de quantidades e preços
              </p>
              <Button 
                onClick={addItem}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Unidade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Preço Unit.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Preço Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {localItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-3">
                          <Input
                            value={item.code}
                            onChange={(e) => updateItem(item.id, 'code', e.target.value)}
                            className="border-0 p-0 h-auto bg-transparent focus:ring-0 text-sm"
                            placeholder="Código"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="border-0 p-0 h-auto bg-transparent focus:ring-0 text-sm"
                            placeholder="Descrição"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                            className="border-0 p-0 h-auto bg-transparent focus:ring-0 text-sm w-20"
                            placeholder="Un."
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="border-0 p-0 h-auto bg-transparent focus:ring-0 text-sm w-24 text-right"
                            placeholder="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="border-0 p-0 h-auto bg-transparent focus:ring-0 text-sm w-24 text-right"
                            placeholder="0,00"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">
                          {formatCurrency(item.totalPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={item.category}
                            onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                            className="border-0 p-0 h-auto bg-transparent focus:ring-0 text-sm"
                            placeholder="Categoria"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            onClick={() => removeItem(item.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300">
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900">
                        TOTAIS:
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {totals.totalQuantity.toFixed(2)}
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">
                        {formatCurrency(totals.totalValue)}
                      </td>
                      <td colSpan={2} className="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 