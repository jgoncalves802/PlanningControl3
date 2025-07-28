'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Settings, Eye, Printer, Mail, Share2 } from 'lucide-react';

interface PDFOptions {
  format: 'A4' | 'A3' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margin: number;
  includeHeader: boolean;
  includeFooter: boolean;
  includePageNumbers: boolean;
  watermark: string;
  quality: 'low' | 'medium' | 'high';
}

interface PDFGeneratorProps {
  documentType: 'technical-proposal' | 'commercial-proposal' | 'service-order' | 'budget';
  documentData: any;
  onGenerate: (options: PDFOptions) => void;
  onPreview?: () => void;
  loading?: boolean;
}

export default function PDFGenerator({ 
  documentType, 
  documentData, 
  onGenerate, 
  onPreview, 
  loading = false 
}: PDFGeneratorProps) {
  const [options, setOptions] = useState<PDFOptions>({
    format: 'A4',
    orientation: 'portrait',
    margin: 20,
    includeHeader: true,
    includeFooter: true,
    includePageNumbers: true,
    watermark: '',
    quality: 'high',
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handleGenerate = () => {
    onGenerate(options);
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'technical-proposal':
        return 'Proposta Técnica';
      case 'commercial-proposal':
        return 'Proposta Comercial';
      case 'service-order':
        return 'Ordem de Serviço';
      case 'budget':
        return 'Orçamento';
      default:
        return type;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'technical-proposal':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'commercial-proposal':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'service-order':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'budget':
        return <FileText className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            {getDocumentTypeIcon(documentType)}
            Gerador de PDF - {getDocumentTypeLabel(documentType)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Formato do Papel</Label>
              <Select value={options.format} onValueChange={(value: any) => setOptions({ ...options, format: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (210 x 297 mm)</SelectItem>
                  <SelectItem value="A3">A3 (297 x 420 mm)</SelectItem>
                  <SelectItem value="Letter">Letter (8.5 x 11 in)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Orientação</Label>
              <Select value={options.orientation} onValueChange={(value: any) => setOptions({ ...options, orientation: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Retrato</SelectItem>
                  <SelectItem value="landscape">Paisagem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Margem (mm)</Label>
              <Input
                type="number"
                value={options.margin}
                onChange={(e) => setOptions({ ...options, margin: parseInt(e.target.value) || 20 })}
                placeholder="20"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Qualidade</Label>
              <Select value={options.quality} onValueChange={(value: any) => setOptions({ ...options, quality: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Marca d'água</Label>
              <Input
                value={options.watermark}
                onChange={(e) => setOptions({ ...options, watermark: e.target.value })}
                placeholder="Ex: RASCUNHO"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opções de Layout */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5 text-purple-600" />
            Opções de Layout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Cabeçalho e Rodapé</h4>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeHeader"
                  checked={options.includeHeader}
                  onChange={(e) => setOptions({ ...options, includeHeader: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="includeHeader" className="text-sm text-gray-700">
                  Incluir cabeçalho
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeFooter"
                  checked={options.includeFooter}
                  onChange={(e) => setOptions({ ...options, includeFooter: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="includeFooter" className="text-sm text-gray-700">
                  Incluir rodapé
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includePageNumbers"
                  checked={options.includePageNumbers}
                  onChange={(e) => setOptions({ ...options, includePageNumbers: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="includePageNumbers" className="text-sm text-gray-700">
                  Incluir numeração de páginas
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Informações do Documento</h4>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Título do Documento</Label>
                <Input
                  value={documentData?.title || ''}
                  readOnly
                  className="border-gray-300 bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Cliente</Label>
                <Input
                  value={documentData?.clientName || ''}
                  readOnly
                  className="border-gray-300 bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Data de Geração</Label>
                <Input
                  value={new Date().toLocaleDateString('pt-BR')}
                  readOnly
                  className="border-gray-300 bg-gray-50"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {previewMode && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Eye className="w-5 h-5 text-blue-600" />
              Prévia do Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[400px]">
              <div className="text-center py-8">
                <FileText className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Prévia do {getDocumentTypeLabel(documentType)}
                </h3>
                <p className="text-gray-600">
                  Aqui será exibida a prévia do documento com as configurações selecionadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Ocultar Prévia' : 'Mostrar Prévia'}
          </Button>

          {onPreview && (
            <Button
              onClick={onPreview}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Mail className="w-4 h-4 mr-2" />
            Enviar por E-mail
          </Button>

          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>

          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Gerando PDF...' : 'Gerar PDF'}
          </Button>
        </div>
      </div>
    </div>
  );
} 