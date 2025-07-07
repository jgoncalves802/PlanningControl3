'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, User, FileText, Phone, MapPin, Briefcase, Clock, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/lib/mock-data';
import { useEmployeeForm } from '@/lib/hooks/useEmployeeForm';
import { toast } from 'react-hot-toast';

interface EmployeeAddModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    'form.adicionar_funcionario': 'Adicionar Funcionário',
    'form.dados_pessoais': 'Dados Pessoais',
    'form.documentos': 'Documentos',
    'form.contato': 'Contato',
    'form.endereco': 'Endereço',
    'form.profissional': 'Profissional',
    'form.horarios': 'Horários',
    'form.notas': 'Notas',
    'form.proximo': 'Próximo',
    'form.anterior': 'Anterior',
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

const EmployeeAddModal: React.FC<EmployeeAddModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    step,
    setStep,
    address,
    setAddress,
    steps,
    validateStep,
    validateCPF,
    formatCPF,
    formatPhone,
    formatCEP,
    searchCEP,
    handleNextStep,
    handlePreviousStep,
    resetForm
  } = useEmployeeForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      return;
    }

    const employeeData: any = {
      ...formData,
      address: address.logradouro ? {
        cep: address.cep,
        logradouro: address.logradouro,
        numero: address.numero,
        complemento: address.complemento,
        bairro: address.bairro,
        cidade: address.cidade,
        uf: address.uf
      } : undefined,
      endereco: address.logradouro ? {
        cep: address.cep,
        logradouro: address.logradouro,
        numero: address.numero,
        complemento: address.complemento,
        bairro: address.bairro,
        cidade: address.cidade,
        uf: address.uf
      } : undefined,
      cep: address.cep,
      city: address.cidade,
      state: address.uf,
      currentFunction: formData.cargo,
      role: formData.cargo,
      shift: formData.turno,
      admissionDate: formData.dataEntrada ? new Date(formData.dataEntrada) : new Date(),
      currentContract: formData.contrato,
      currentContractId: formData.contrato,
      isActive: true
    };

    try {
      await onSubmit(employeeData);
      resetForm();
      onClose();
      toast.success('Funcionário adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      toast.error('Erro ao adicionar funcionário');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                {t('form.adicionar_funcionario')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Passo {step + 1} de {steps.length}: {steps[step]}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            {steps.map((stepName, index) => (
              <div
                key={index}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index <= step
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      index < step
                        ? 'bg-primary'
                        : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-400">
            {steps[step]}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {/* Step 0: Dados Pessoais */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                    {t('form.dados_pessoais')}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.nome')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Digite o nome completo"
                    />
                    {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.cpf')} *
                    </label>
                    <input
                      type="text"
                      value={formData.cpf || ''}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value);
                        setFormData(prev => ({ ...prev, cpf: formatted }));
                        if (formatted.length === 14) {
                          const isValid = validateCPF(formatted);
                          if (!isValid) {
                            setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
                          } else {
                            setErrors(prev => ({ ...prev, cpf: '' }));
                          }
                        }
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
                      {t('form.rg')}
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
                      {t('form.data_nascimento')}
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate ? (typeof formData.birthDate === 'string' ? formData.birthDate.split('T')[0] : formData.birthDate.toISOString().split('T')[0]) : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.genero')}
                    </label>
                    <select
                      value={formData.gender || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
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
                      {t('form.estado_civil')}
                    </label>
                    <select
                      value={formData.maritalStatus || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, maritalStatus: e.target.value }))}
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

            {/* Step 1: Documentos */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                    {t('form.documentos')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.pis')}
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
                      {t('form.ctps')}
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
                      {t('form.ctps_serie')}
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
                      {t('form.ctps_uf')}
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
                      {t('form.cnh')}
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
                      {t('form.cnh_categoria')}
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

            {/* Step 2: Contato */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Phone className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                    {t('form.contato')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.telefone')} *
                    </label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setFormData(prev => ({ ...prev, phone: formatted }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                    {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Endereço */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                    {t('form.endereco')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.cep')}
                    </label>
                    <input
                      type="text"
                      value={address.cep}
                      onChange={(e) => {
                        const formatted = formatCEP(e.target.value);
                        setAddress(prev => ({ ...prev, cep: formatted }));
                        if (formatted.length === 9) {
                          searchCEP(formatted);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.logradouro')}
                    </label>
                    <input
                      type="text"
                      value={address.logradouro}
                      onChange={(e) => setAddress(prev => ({ ...prev, logradouro: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.numero')}
                    </label>
                    <input
                      type="text"
                      value={address.numero}
                      onChange={(e) => setAddress(prev => ({ ...prev, numero: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.complemento')}
                    </label>
                    <input
                      type="text"
                      value={address.complemento}
                      onChange={(e) => setAddress(prev => ({ ...prev, complemento: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="Apto, Bloco, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.bairro')}
                    </label>
                    <input
                      type="text"
                      value={address.bairro}
                      onChange={(e) => setAddress(prev => ({ ...prev, bairro: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.cidade')}
                    </label>
                    <input
                      type="text"
                      value={address.cidade}
                      onChange={(e) => setAddress(prev => ({ ...prev, cidade: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.uf')}
                    </label>
                    <select
                      value={address.uf}
                      onChange={(e) => setAddress(prev => ({ ...prev, uf: e.target.value }))}
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
            )}

            {/* Step 4: Profissional */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                    {t('form.profissional')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.cargo')} *
                    </label>
                    <input
                      type="text"
                      value={formData.cargo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${
                        errors.cargo ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Ex: Pedreiro, Eletricista, etc."
                    />
                    {errors.cargo && <span className="text-xs text-red-500 mt-1">{errors.cargo}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.turno')}
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
                      {t('form.data_entrada')} *
                    </label>
                    <input
                      type="date"
                      value={formData.dataEntrada || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataEntrada: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${
                        errors.dataEntrada ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                    {errors.dataEntrada && <span className="text-xs text-red-500 mt-1">{errors.dataEntrada}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.contrato')}
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
                      {t('form.salario')}
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
                      {t('form.status')}
                    </label>
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    >
                      <option value="active">Ativo</option>
                      <option value="on_leave">Em Licença</option>
                      <option value="transferred">Transferido</option>
                      <option value="dismissed">Demitido</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Horários */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                    {t('form.horarios')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      {t('form.horas_normais')}
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
                      {t('form.horas_extras')}
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
                      {t('form.horas_noturnas')}
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

            {/* Step 6: Notas */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <StickyNote className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                    {t('form.notas')}
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    {t('form.observacoes')}
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="Informações adicionais sobre o funcionário..."
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={isLoading}
              >
                {t('form.anterior')}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('form.cancelar')}
            </Button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={isLoading}
              >
                {t('form.proximo')}
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : t('form.salvar')}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeAddModal; 