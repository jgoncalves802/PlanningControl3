'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PersonalSettings {
  name: string;
  email: string;
  phone: string;
  language: string;
  timezone: string;
  theme: string;
  avatar?: string;
}

const defaultSettings: PersonalSettings = {
  name: '',
  email: '',
  phone: '',
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  theme: 'system',
  avatar: undefined,
};

export default function PersonalSettings() {
  const [data, setData] = useState<PersonalSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar configurações do localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('personal-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setData({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações pessoais:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (field: keyof PersonalSettings, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Salvar no localStorage
      localStorage.setItem('personal-settings', JSON.stringify(data));
      
      // Aplicar tema
      if (data.theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else if (data.theme === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        // system - usar preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      }

      // Aplicar idioma
      localStorage.setItem('locale', data.language);
      
      toast.success('Configurações aplicadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Configurações Pessoais
          </CardTitle>
          <CardDescription>
            Carregando...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Configurações Pessoais
        </CardTitle>
        <CardDescription>
          Gerencie suas informações pessoais e preferências
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={data.avatar} alt={data.name} />
            <AvatarFallback className="text-lg">
              {data.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Camera className="h-4 w-4 mr-2" />
                  Alterar Avatar
                </span>
              </Button>
            </Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <p className="text-sm text-muted-foreground">
              Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB
            </p>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite seu nome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Digite seu email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Digite seu telefone"
            />
          </div>
        </div>

        {/* Preferências */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select value={data.language} onValueChange={(value) => handleInputChange('language', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português</SelectItem>
                <SelectItem value="en-US">English</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Fuso Horário</Label>
            <Select value={data.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o fuso horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                <SelectItem value="America/Belem">Belém (UTC-3)</SelectItem>
                <SelectItem value="America/Fortaleza">Fortaleza (UTC-3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <Select value={data.theme} onValueChange={(value) => handleInputChange('theme', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
      </CardContent>
    </Card>
  );
} 