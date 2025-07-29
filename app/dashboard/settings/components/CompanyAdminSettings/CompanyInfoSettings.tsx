'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Building, Upload, Globe, Clock, Palette, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CompanyInfo {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  language: string;
  customDomain?: string;
  isActive: boolean;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
  updatedAt: string;
}

export default function CompanyInfoSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    id: 'emp1',
    name: 'Empresa Demo Ltda',
    cnpj: '12.345.678/0001-90',
    email: 'contato@empresademo.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    website: 'https://empresademo.com',
    logo: '/logo-default.png',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    customDomain: 'app.empresademo.com',
    isActive: true,
    plan: 'PRO',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-07-28T15:30:00Z'
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const timezones = [
    { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
    { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
    { value: 'America/Belem', label: 'Belém (GMT-3)' },
    { value: 'America/Fortaleza', label: 'Fortaleza (GMT-3)' },
    { value: 'America/Recife', label: 'Recife (GMT-3)' },
    { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)' }
  ];

  const languages = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Español' }
  ];

  const plans = [
    { value: 'BASIC', label: 'Básico', features: ['Até 10 usuários', 'Funcionalidades básicas'] },
    { value: 'PRO', label: 'Profissional', features: ['Até 50 usuários', 'Funcionalidades avançadas'] },
    { value: 'ENTERPRISE', label: 'Empresarial', features: ['Usuários ilimitados', 'Todas as funcionalidades'] }
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Logo deve ter menos de 5MB');
        return;
      }
      setLogoFile(file);
      // Simular preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyInfo(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui seria feita a chamada para a API
      console.log('Salvando informações da empresa:', companyInfo);
      
      toast.success('Informações da empresa atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar informações da empresa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informações Básicas da Empresa
          </CardTitle>
          <CardDescription>
            Configure as informações principais da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome da empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={companyInfo.cnpj}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contato@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Digite o endereço completo"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://empresa.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo e Identidade Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Logo e Identidade Visual
          </CardTitle>
          <CardDescription>
            Personalize a aparência da sua empresa no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-20 w-20">
                <AvatarImage src={companyInfo.logo} />
                <AvatarFallback className="text-lg">
                  {companyInfo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">Logo atual</div>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="logo">Upload do Logo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PNG, JPG, SVG. Máximo 5MB.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={companyInfo.primaryColor}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={companyInfo.primaryColor}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#007bff"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={companyInfo.secondaryColor}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={companyInfo.secondaryColor}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  placeholder="#6c757d"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Regionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configurações Regionais
          </CardTitle>
          <CardDescription>
            Configure fuso horário, idioma e domínio personalizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select
                value={companyInfo.timezone}
                onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(timezone => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={companyInfo.language}
                onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(language => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customDomain">Domínio Personalizado</Label>
              <Input
                id="customDomain"
                value={companyInfo.customDomain}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, customDomain: e.target.value }))}
                placeholder="app.empresa.com"
              />
              <p className="text-xs text-muted-foreground">
                Configure um domínio personalizado para acessar o sistema
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status e Plano */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status e Plano
          </CardTitle>
          <CardDescription>
            Gerencie o status da empresa e visualize o plano atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Status da Empresa</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={companyInfo.isActive}
                  onCheckedChange={(checked) => setCompanyInfo(prev => ({ ...prev, isActive: checked }))}
                />
                <Badge variant={companyInfo.isActive ? 'default' : 'secondary'}>
                  {companyInfo.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Plano Atual</Label>
              <Badge variant="outline" className="text-sm">
                {plans.find(p => p.value === companyInfo.plan)?.label}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Recursos do Plano</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {plans.find(p => p.value === companyInfo.plan)?.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 