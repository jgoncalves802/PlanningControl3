'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Calculator, Variable, Code, TestTube, CheckCircle, XCircle } from 'lucide-react';
import * as math from 'mathjs';

interface FormulaVariable {
  id: string;
  name: string;
  description: string;
  defaultValue: number;
  unit: string;
  category: string;
}

interface Formula {
  id: string;
  name: string;
  description: string;
  formula: string;
  variables: FormulaVariable[];
  category: string;
  isActive: boolean;
}

interface FormulaEditorProps {
  formula?: Formula;
  onSave: (formula: Omit<Formula, 'id'>) => void;
  loading?: boolean;
}

export default function FormulaEditor({ formula, onSave, loading = false }: FormulaEditorProps) {
  const [formData, setFormData] = useState({
    name: formula?.name || '',
    description: formula?.description || '',
    formula: formula?.formula || '',
    category: formula?.category || '',
    isActive: formula?.isActive ?? true,
  });
  const [variables, setVariables] = useState<FormulaVariable[]>(formula?.variables || []);
  const [testValues, setTestValues] = useState<Record<string, number>>({});
  const [testResult, setTestResult] = useState<{ success: boolean; result?: number; error?: string } | null>(null);

  useEffect(() => {
    if (formula) {
      setFormData({
        name: formula.name,
        description: formula.description,
        formula: formula.formula,
        category: formula.category,
        isActive: formula.isActive,
      });
      setVariables(formula.variables);
      
      // Inicializar valores de teste
      const initialTestValues: Record<string, number> = {};
      formula.variables.forEach(variable => {
        initialTestValues[variable.name] = variable.defaultValue;
      });
      setTestValues(initialTestValues);
    }
  }, [formula]);

  const addVariable = () => {
    const newVariable: FormulaVariable = {
      id: `var-${Date.now()}`,
      name: '',
      description: '',
      defaultValue: 0,
      unit: '',
      category: '',
    };
    setVariables([...variables, newVariable]);
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter(variable => variable.id !== id));
  };

  const updateVariable = (id: string, field: keyof FormulaVariable, value: any) => {
    const updatedVariables = variables.map(variable => {
      if (variable.id === id) {
        return { ...variable, [field]: value };
      }
      return variable;
    });
    setVariables(updatedVariables);
  };

  const handleSave = () => {
    if (!formData.name || !formData.formula) {
      alert('Nome e fórmula são obrigatórios');
      return;
    }

    // Validar se todas as variáveis na fórmula estão definidas
    const formulaVariables = extractVariablesFromFormula(formData.formula);
    const definedVariables = variables.map(v => v.name);
    const missingVariables = formulaVariables.filter(v => !definedVariables.includes(v));

    if (missingVariables.length > 0) {
      alert(`Variáveis não definidas: ${missingVariables.join(', ')}`);
      return;
    }

    onSave({
      ...formData,
      variables,
    });
  };

  const extractVariablesFromFormula = (formula: string): string[] => {
    try {
      const node = math.parse(formula);
      const variables: string[] = [];
      
      node.traverse((node) => {
        if (node.type === 'SymbolNode' && !['pi', 'e', 'i', 'Infinity', 'NaN'].includes(node.name)) {
          if (!variables.includes(node.name)) {
            variables.push(node.name);
          }
        }
      });
      
      return variables;
    } catch (error) {
      return [];
    }
  };

  const testFormula = () => {
    try {
      // Criar escopo com valores de teste
      const scope: Record<string, number> = {};
      variables.forEach(variable => {
        scope[variable.name] = testValues[variable.name] || variable.defaultValue;
      });

      // Avaliar fórmula
      const result = math.evaluate(formData.formula, scope);
      
      setTestResult({
        success: true,
        result: typeof result === 'number' ? result : Number(result),
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  };

  const updateTestValue = (variableName: string, value: number) => {
    setTestValues(prev => ({
      ...prev,
      [variableName]: value,
    }));
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const formulaVariables = extractVariablesFromFormula(formData.formula);

  return (
    <div className="space-y-6">
      {/* Dados básicos da fórmula */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Code className="w-5 h-5 text-blue-600" />
            Dados da Fórmula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Nome da Fórmula <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cálculo de Encargos Sociais"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                placeholder="Ex: Encargos, BDI, Custos"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
              placeholder="Descreva o propósito e uso da fórmula..."
              className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="formula" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Fórmula <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Textarea
                id="formula"
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                placeholder="Ex: (salario * 0.08) + (salario * 0.20) + (salario * 0.05)"
                className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none font-mono text-sm"
                rows={4}
                required
              />
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={testFormula}
                  className="h-8 w-8 p-0"
                >
                  <TestTube className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Use variáveis definidas abaixo. Operadores: +, -, *, /, ^, (), sin, cos, log, etc.
            </p>
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
              Fórmula ativa
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Variáveis da fórmula */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Variable className="w-5 h-5 text-green-600" />
              Variáveis da Fórmula
            </CardTitle>
            <Button 
              onClick={addVariable} 
              size="sm"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Variável
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {variables.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Variable className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma variável definida</h3>
              <p className="text-gray-600 mb-6">
                Adicione variáveis para usar na fórmula
              </p>
              <Button 
                onClick={addVariable}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Variável
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {variables.map((variable, index) => (
                <div key={variable.id} className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Nome</Label>
                    <Input
                      value={variable.name}
                      onChange={(e) => updateVariable(variable.id, 'name', e.target.value)}
                      placeholder="Ex: salario"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                    <Input
                      value={variable.description}
                      onChange={(e) => updateVariable(variable.id, 'description', e.target.value)}
                      placeholder="Descrição da variável"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Valor Padrão</Label>
                    <Input
                      type="number"
                      value={variable.defaultValue}
                      onChange={(e) => updateVariable(variable.id, 'defaultValue', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      step="0.01"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Unidade</Label>
                    <Input
                      value={variable.unit}
                      onChange={(e) => updateVariable(variable.id, 'unit', e.target.value)}
                      placeholder="Ex: R$, %, m²"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Categoria</Label>
                    <Input
                      value={variable.category}
                      onChange={(e) => updateVariable(variable.id, 'category', e.target.value)}
                      placeholder="Ex: Salário, Encargos"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 opacity-0">Ações</Label>
                    <Button
                      onClick={() => removeVariable(variable.id)}
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

      {/* Teste da fórmula */}
      {formData.formula && variables.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TestTube className="w-5 h-5 text-purple-600" />
              Teste da Fórmula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Valores de teste */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {variables.map((variable) => (
                  <div key={variable.id} className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {variable.name} {variable.unit && `(${variable.unit})`}
                    </Label>
                    <Input
                      type="number"
                      value={testValues[variable.name] || variable.defaultValue}
                      onChange={(e) => updateTestValue(variable.name, parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      step="0.01"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {variable.description && (
                      <p className="text-xs text-gray-500">{variable.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Botão de teste */}
              <div className="flex justify-center">
                <Button
                  onClick={testFormula}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Testar Fórmula
                </Button>
              </div>

              {/* Resultado do teste */}
              {testResult && (
                <div className={`p-4 rounded-lg border ${
                  testResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <h4 className={`font-medium ${
                        testResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {testResult.success ? 'Teste bem-sucedido!' : 'Erro no teste'}
                      </h4>
                      {testResult.success && testResult.result !== undefined && (
                        <p className="text-green-700 text-lg font-mono">
                          Resultado: {formatNumber(testResult.result)}
                        </p>
                      )}
                      {!testResult.success && testResult.error && (
                        <p className="text-red-700 text-sm">{testResult.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validação de variáveis */}
      {formData.formula && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Validação da Fórmula</h4>
              <div className="text-sm text-gray-600">
                <p><strong>Variáveis encontradas na fórmula:</strong> {formulaVariables.join(', ') || 'Nenhuma'}</p>
                <p><strong>Variáveis definidas:</strong> {variables.map(v => v.name).join(', ') || 'Nenhuma'}</p>
                
                {formulaVariables.length > 0 && (
                  <div className="mt-2">
                    {formulaVariables.every(v => variables.some(variable => variable.name === v)) ? (
                      <p className="text-green-600">✅ Todas as variáveis estão definidas</p>
                    ) : (
                      <p className="text-red-600">
                        ⚠️ Variáveis não definidas: {
                          formulaVariables.filter(v => !variables.some(variable => variable.name === v)).join(', ')
                        }
                      </p>
                    )}
                  </div>
                )}
              </div>
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
          Salvar Fórmula
        </Button>
      </div>
    </div>
  );
} 