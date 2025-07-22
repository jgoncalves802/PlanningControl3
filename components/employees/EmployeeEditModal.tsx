'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, User, FileText, Phone, MapPin, Briefcase, Clock, StickyNote, Camera, UserCheck, CreditCard, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/lib/mock-data';
import { useEmployeeForm } from '@/lib/hooks/useEmployeeForm';
import { toast } from 'react-hot-toast';
import FunctionSelector from '@/components/functions/FunctionSelector';

interface EmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSubmit: (employee: Partial<Employee>) => void;
  isLoading?: boolean;
}

// Função de compatibilidade para traduções
const t = (key: string) => {
  const translations: { [key: string]: string } = {
    'form.nome': 'Nome',
    'form.cpf': 'CPF',
    'form.rg': 'RG',
    'form.email': 'Email',
    'form.telefone': 'Telefone',
    'form.data_nascimento': 'Data de Nascimento',
    'form.genero': 'Gênero',
    'form.estado_civil': 'Estado Civil',
    'form.nacionalidade': 'Nacionalidade',
    'form.naturalidade': 'Naturalidade',
    'form.nome_mae': 'Nome da Mãe',
    'form.nome_pai': 'Nome do Pai',
    'form.pis': 'PIS',
    'form.ctps': 'CTPS',
    'form.ctps_serie': 'CTPS Série',
    'form.ctps_uf': 'CTPS UF',
    'form.titulo_eleitor': 'Título de Eleitor',
    'form.cnh': 'CNH',
    'form.cnh_categoria': 'CNH Categoria',
    'form.cnh_validade': 'CNH Validade',
    'form.cep': 'CEP',
    'form.logradouro': 'Logradouro',
    'form.numero': 'Número',
    'form.complemento': 'Complemento',
    'form.bairro': 'Bairro',
    'form.cidade': 'Cidade',
    'form.uf': 'UF',
    'form.cargo': 'Cargo',
    'form.turno': 'Turno',
    'form.data_entrada': 'Data de Entrada',
    'form.contrato': 'Contrato',
    'form.salario': 'Salário',
    'form.observacoes': 'Observações',
    'form.status': 'Status',
    'form.editar_funcionario': 'Editar Funcionário',
    'form.dados_pessoais': 'Dados Pessoais',
    'form.documentos': 'Documentos',
    'form.contato': 'Contato',
    'form.endereco': 'Endereço',
    'form.profissional': 'Profissional',
    'form.horarios': 'Horários',
    'form.notas': 'Notas',
    'form.salvar': 'Salvar',
    'form.cancelar': 'Cancelar',
    'form.centro_custo': 'Centro de Custo',
    'form.obra': 'Obra',
    'form.primeira_experiencia': 'Primeira Experiência',
    'form.segunda_experiencia': 'Segunda Experiência',
    'form.previsao_obra': 'Previsão da Obra',
    'form.mo': 'Tipo de Mão de Obra',
    'form.horas_normais': 'Horas Normais',
    'form.horas_extras': 'Horas Extras',
    'form.horas_noturnas': 'Horas Noturnas',
    'form.local_alojado': 'Local Alojado',
    'form.ponto_referencia': 'Ponto de Referência',
    'form.status_bancodoc': 'Status Banco de Documentos',
    'form.efetivo_rdo': 'Efetivo RDO'
  };
  return translations[key] || key;
};

const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Dados Pessoais', icon: UserCheck },
    { id: 'contact', label: 'Contato & Endereço', icon: Phone },
    { id: 'professional', label: 'Profissional', icon: Briefcase },
    { id: 'documents', label: 'Documentos', icon: CreditCard },
    { id: 'work', label: 'Horários', icon: Clock },
    { id: 'notes', label: 'Observações', icon: StickyNote }
  ];

  // Inicializar dados do formulário quando o funcionário for carregado
  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        dataEntrada: employee.admissionDate ? formatDateInput(employee.admissionDate) : '',
        cargo: (typeof employee.currentFunction === 'object' ? employee.currentFunction?.name : employee.currentFunction) || '',
        turno: employee.shift || '',
        contrato: employee.currentContract || '',
        endereco: employee.endereco || employee.address || {},
        dataNascimento: employee.birthDate ? formatDateInput(employee.birthDate) : '',
        companyFunctionId: employee.companyFunctionId || ''
      });
      setAvatarPreview(employee.avatar || '');
    }
  }, [employee]);

  function formatDateInput(date: Date | string) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  function validateCPF(cpf: string) {
    if (!cpf || cpf.trim() === '') return false;
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
    let sum = 0, rest;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  }

  function formatCPF(cpf: string) {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
  }

  function formatPhone(phone: string) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    } else {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
  }

  function formatCEP(cep: string) {
    cep = cep.replace(/\D/g, '');
    cep = cep.replace(/(\d{5})(\d)/, '$1-$2');
    return cep;
  }

  async function searchCEP(cep: string) {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      toast.error('CEP deve ter 8 dígitos');
      return;
    }
    
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((prev: any) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: formatCEP(cleanCep),
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || ''
          }
        }));
        toast.success('Endereço preenchido automaticamente!');
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (e) {
      toast.error('Erro ao buscar CEP');
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.cpf?.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const employeeData: any = {
      ...formData,
      admissionDate: formData.dataEntrada ? new Date(formData.dataEntrada) : formData.admissionDate,
      birthDate: formData.dataNascimento ? new Date(formData.dataNascimento) : formData.birthDate,

      shift: formData.turno,
      address: formData.endereco,
      isActive: formData.status === 'active',
      avatar: avatarPreview || formData.avatar,
      companyFunctionId: formData.companyFunctionId || null
    };

    // Remover campos que podem causar problemas de chave estrangeira
    delete employeeData.currentContract;
    delete employeeData.currentContractId;
    delete employeeData.currentFunction;
    delete employeeData.currentFunctionId;
    delete employeeData.contrato;
    delete employeeData.cargo; // já mapeado para currentFunction
    delete employeeData.turno; // já mapeado para shift
    delete employeeData.dataEntrada; // já mapeado para admissionDate
    delete employeeData.dataNascimento; // já mapeado para birthDate
    delete employeeData.endereco; // já mapeado para address

    try {
      await onSubmit(employeeData);
      toast.success('Funcionário atualizado com sucesso!');
      handleClose();
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      toast.error('Erro ao atualizar funcionário');
    }
  };

  const handleClose = () => {
    setErrors({});
    setActiveTab('personal');
    onClose();
  };

  // Função para comprimir imagem
  const compressImage = (file: File, maxWidth: number = 300, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular dimensões mantendo proporção
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Converter para base64 com compressão
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Verificar tamanho do arquivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Arquivo muito grande. Máximo permitido: 5MB');
          return;
        }
        
        setAvatarFile(file);
        
        // Comprimir imagem antes de definir o preview
        const compressedImage = await compressImage(file, 300, 0.8);
        setAvatarPreview(compressedImage);
        

      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        toast.error('Erro ao processar imagem');
      }
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer hover:bg-primary/80 transition-colors">
                <Camera className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                {t('form.editar_funcionario')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {employee.name} • Matrícula: {employee.id.padStart(6, '0')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Dados Pessoais */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Nome completo do funcionário"
                    />
                    {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      CPF *
                    </label>
                    <input
                      type="text"
                      value={formData.cpf || ''}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value);
                        setFormData(prev => ({ ...prev, cpf: formatted }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${
                        errors.cpf ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    {errors.cpf && <span className="text-xs text-red-500 mt-1">{errors.cpf}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      RG
                    </label>
                    <input
                      type="text"
                      value={formData.rg || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="00.000.000-0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.dataNascimento || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataNascimento: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Sexo
                    </label>
                    <select
                      value={formData.sexo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, sexo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    >
                      <option value="">Selecione</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="O">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Estado Civil
                    </label>
                    <select
                      value={formData.estadoCivil || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, estadoCivil: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    >
                      <option value="">Selecione</option>
                      <option value="solteiro">Solteiro(a)</option>
                      <option value="casado">Casado(a)</option>
                      <option value="divorciado">Divorciado(a)</option>
                      <option value="viuvo">Viúvo(a)</option>
                      <option value="uniao_estavel">União Estável</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Contato & Endereço */}
            {activeTab === 'contact' && (
              <div className="space-y-8">
                {/* Contato */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Informações de Contato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={formData.phone || ''}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setFormData(prev => ({ ...prev, phone: formatted }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Endereço
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={formData.endereco?.cep || ''}
                        onChange={(e) => {
                          const formatted = formatCEP(e.target.value);
                          setFormData(prev => ({ 
                            ...prev, 
                            endereco: { ...prev.endereco, cep: formatted }
                          }));
                          if (formatted.length === 9) {
                            searchCEP(formatted);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        placeholder="00000-000"
                        maxLength={9}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Logradouro
                      </label>
                      <input
                        type="text"
                        value={formData.endereco?.logradouro || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          endereco: { ...prev.endereco, logradouro: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        placeholder="Rua, Avenida, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Número
                      </label>
                      <input
                        type="text"
                        value={formData.endereco?.numero || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          endereco: { ...prev.endereco, numero: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        placeholder="123"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={formData.endereco?.complemento || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          endereco: { ...prev.endereco, complemento: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        placeholder="Apto, Bloco, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={formData.endereco?.bairro || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          endereco: { ...prev.endereco, bairro: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        placeholder="Nome do bairro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={formData.endereco?.cidade || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          endereco: { ...prev.endereco, cidade: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        placeholder="Nome da cidade"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        UF
                      </label>
                      <select
                        value={formData.endereco?.uf || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          endereco: { ...prev.endereco, uf: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      >
                        <option value="">Selecione</option>
                        <option value="SP">São Paulo</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="PR">Paraná</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="BA">Bahia</option>
                        <option value="GO">Goiás</option>
                        <option value="PE">Pernambuco</option>
                        <option value="CE">Ceará</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dados Profissionais */}
            {activeTab === 'professional' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Cargo
                    </label>
                    <FunctionSelector
                      value={formData.companyFunctionId || ''}
                      onChange={(functionId, functionData) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          companyFunctionId: functionId,
                          cargo: functionData?.name || '',
                          mo: functionData?.laborType || ''
                        }))
                      }}
                      placeholder="Selecione uma função"
                      showCreateButton={false}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Turno
                    </label>
                    <select
                      value={formData.turno || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, turno: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    >
                      <option value="">Selecione</option>
                      <option value="diurno">Diurno</option>
                      <option value="noturno">Noturno</option>
                      <option value="revezamento">Revezamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Data de Entrada
                    </label>
                    <input
                      type="date"
                      value={formData.dataEntrada || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataEntrada: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Contrato
                    </label>
                    <select
                      value={formData.contrato || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, contrato: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    >
                      <option value="">Selecione</option>
                      <option value="CONTRATO-001">Contrato 001</option>
                      <option value="CONTRATO-002">Contrato 002</option>
                      <option value="CONTRATO-003">Contrato 003</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Salário
                    </label>
                    <input
                      type="number"
                      value={formData.salary || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${
                        errors.status ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                    >
                      <option value="">Selecione</option>
                      <option value="active">Ativo</option>
                      <option value="on_leave">Em Licença</option>
                      <option value="transferred">Transferido</option>
                      <option value="dismissed">Demitido</option>
                    </select>
                    {errors.status && <span className="text-xs text-red-500 mt-1">{errors.status}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Documentos */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      PIS/PASEP
                    </label>
                    <input
                      type="text"
                      value={formData.pis || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, pis: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="000.00000.00-0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      CTPS
                    </label>
                    <input
                      type="text"
                      value={formData.ctps || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, ctps: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="0000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      CTPS Série
                    </label>
                    <input
                      type="text"
                      value={formData.ctpsSeries || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, ctpsSeries: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      CTPS UF
                    </label>
                    <select
                      value={formData.ctpsUf || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, ctpsUf: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    >
                      <option value="">Selecione</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="PR">Paraná</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="BA">Bahia</option>
                      <option value="GO">Goiás</option>
                      <option value="PE">Pernambuco</option>
                      <option value="CE">Ceará</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      CNH
                    </label>
                    <input
                      type="text"
                      value={formData.cnh || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cnh: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="00000000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      CNH Categoria
                    </label>
                    <select
                      value={formData.cnhCategory || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cnhCategory: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    >
                      <option value="">Selecione</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="AB">AB</option>
                      <option value="AC">AC</option>
                      <option value="AD">AD</option>
                      <option value="AE">AE</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Horários */}
            {activeTab === 'work' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Horas Normais
                    </label>
                    <input
                      type="number"
                      value={formData.horasNormaisTrabalhadas || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, horasNormaisTrabalhadas: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Horas Extras
                    </label>
                    <input
                      type="number"
                      value={formData.horasExtrasTrabalhadas || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, horasExtrasTrabalhadas: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Horas Noturnas
                    </label>
                    <input
                      type="number"
                      value={formData.horasNoturnasTrabalhadas || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, horasNoturnasTrabalhadas: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Observações */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Notas Adicionais
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="Informações adicionais sobre o funcionário..."
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            * Campos obrigatórios
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('form.cancelar')}
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {t('form.salvar')}
                </div>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeEditModal; 
