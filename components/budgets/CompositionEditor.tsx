'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Calculator, Search, BookOpen, Package, DollarSign, Hash } from 'lucide-react';
import { useCompositions } from '@/lib/hooks/useCompositions';

interface CompositionItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Composition {
  id: string;
  name: string;
  code: string;
  description?: string;
  unit: string;
  category?: string;
  items: CompositionItem[];
}

interface CompositionEditorProps {
  composition?: Composition;
  onSave: (composition: Omit<Composition, 'id'>) => void;
  loading?: boolean;
}

export default function CompositionEditor({ composition, onSave, loading = false }: CompositionEditorProps) {
  const [formData, setFormData] = useState({
    name: composition?.name || '',
    code: composition?.code || '',
    description: composition?.description || '',
    unit: composition?.unit || '',
    category: composition?.category || '',
  });
  const [items, setItems] = useState<CompositionItem[]>(composition?.items || []);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { compositions, isLoading: loadingCompositions } = useCompositions(1, searchTerm);

  useEffect(() => {
    if (composition) {
      setFormData({
        name: composition.name,
        code: composition.code,
        description: composition.description || '',
        unit: composition.unit,
        category: composition.category || '',
      });
      setItems(composition.items);
    }
  }, [composition]);

  const addItem = () => {
    const newItem: CompositionItem = {
      id: `item-${Date.now()}`,
      description: '',
      unit: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof CompositionItem, value: any) => {
    const updatedItems = items.map(item => {
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
    
    setItems(updatedItems);
  };

  const handleSave = () => {
    if (!formData.name || !formData.code || !formData.unit) {
      alert('Nome, código e unidade são obrigatórios');
      return;
    }

    onSave({
      ...formData,
      items,
    });
  };

  const importFromLibrary = (selectedComposition: Composition) => {
    setItems(selectedComposition.items);
    setFormData(prev => ({
      ...prev,
      unit: selectedComposition.unit,
      category: selectedComposition.category || '',
    }));
    setShowLibrary(false);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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
                <p className="text-sm text-blue-700 font-medium">Itens na Composição</p>
                <p className="text-2xl font-bold text-blue-900">{items.length}</p>
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
                <p className="text-sm text-green-700 font-medium">Unidade</p>
                <p className="text-2xl font-bold text-green-900">{formData.unit || 'Não definida'}</p>
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
                <p className="text-sm text-purple-700 font-medium">Custo Unitário</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(calculateTotal())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dados básicos da composição */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="w-5 h-5 text-blue-600" />
              Dados da Composição
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowLibrary(!showLibrary)}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Biblioteca
              </Button>
              <Button 
                onClick={handleSave} 
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Nome da Composição <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Alvenaria de tijolo furado"
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Código Único <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: COMP-001"
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
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
              placeholder="Descreva a composição e suas características..."
              className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Unidade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Ex: m², m³, un"
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Categoria
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Alvenaria, Acabamento"
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biblioteca de composições */}
      {showLibrary && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Biblioteca de Composições
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar composições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loadingCompositions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando composições...</p>
              </div>
            ) : compositions.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">Nenhuma composição encontrada</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {compositions.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                    onClick={() => importFromLibrary(comp)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{comp.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                        <span className="font-mono">{comp.code}</span>
                        <span>•</span>
                        <span>{comp.unit}</span>
                        <span>•</span>
                        <span>{comp.items.length} itens</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Button variant="ghost" size="sm">
                        Importar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Itens da composição */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Package className="w-5 h-5 text-blue-600" />
              Itens da Composição
            </CardTitle>
            <Button 
              onClick={addItem} 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item adicionado</h3>
              <p className="text-gray-600 mb-6">
                Adicione itens para compor o preço unitário
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
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
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
                    <Label className="text-sm font-medium text-gray-700">Unidade</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      placeholder="Un."
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Quantidade</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      step="0.01"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Preço Unit.</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      step="0.01"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Preço Total</Label>
                    <div className="px-3 py-2 bg-green-50 border border-green-200 rounded font-medium text-green-700">
                      {formatCurrency(item.totalPrice)}
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

              {/* Total da composição */}
              <div className="flex justify-end p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Custo Unitário da Composição:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculateTotal())}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 