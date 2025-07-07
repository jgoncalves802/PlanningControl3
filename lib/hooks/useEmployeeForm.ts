import { useState } from 'react';
import { Employee } from '@/lib/mock-data';
import { toast } from 'react-hot-toast';

export interface EmployeeFormData extends Omit<Partial<Employee>, 'primeiraExperiencia' | 'segundaExperiencia' | 'previsaoObra'> {
  cargo?: string;
  turno?: string;
  dataEntrada?: string;
  contrato?: string;
  salary?: number;
  primeiraExperiencia?: string | Date;
  segundaExperiencia?: string | Date;
  previsaoObra?: string | Date;
}

export function useEmployeeForm(initialData: EmployeeFormData = { status: 'active' }) {
  const [formData, setFormData] = useState<EmployeeFormData>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });

  const steps = [
    'Dados Pessoais',
    'Endereço',
    'Dados Profissionais',
    'Documentos',
    'Observações'
  ];

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

  function maskPhone(phone: string) {
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

  function validatePhone(phone: string) {
    if (!phone) return true;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  }

  function formatCEP(cep: string) {
    cep = cep.replace(/\D/g, '');
    cep = cep.replace(/(\d{5})(\d)/, '$1-$2');
    return cep;
  }

  function formatPhone(phone: string) {
    return maskPhone(phone);
  }

  function searchCEP(cep: string) {
    fetchAddressByCep(cep);
  }

  function handleNextStep() {
    handleNext();
  }

  function handlePreviousStep() {
    handlePrev();
  }

  function validateStep(currentStep: number) {
    const newErrors: { [key: string]: string } = {};
    if (currentStep === 0) {
      if (!formData.name) newErrors.name = 'Nome é obrigatório';
      if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
      else if (!validateCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';
    }
    if (currentStep === 2) {
      if (formData.phone && !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(maskPhone(formData.phone))) {
        newErrors.phone = 'Telefone inválido';
      }
    }
    if (currentStep === 4) {
      if (!formData.cargo) newErrors.cargo = 'Cargo é obrigatório';
      if (!formData.dataEntrada) newErrors.dataEntrada = 'Data de entrada é obrigatória';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const validateEditForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.cpf?.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else {
      const cleanCpf = formData.cpf.replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        newErrors.cpf = 'CPF deve ter 11 dígitos';
      } else if (/^([0-9])\1+$/.test(cleanCpf)) {
        newErrors.cpf = 'CPF não pode ter todos os dígitos iguais';
      } else if (!validateCPF(formData.cpf)) {
        newErrors.cpf = 'CPF inválido - verifique os dígitos verificadores';
      }
    }
    
    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos - Ex: (11) 99999-9999';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido - Ex: usuario@empresa.com';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function fetchAddressByCep(cep: string, isEdit = false) {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      if (!isEdit) toast.error('CEP deve ter 8 dígitos');
      return;
    }
    
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        if (isEdit) {
          setFormData(prev => ({
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
          setAddress(prev => ({
            ...prev,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || ''
          }));
          toast.success('Endereço preenchido automaticamente!');
        }
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (e) {
      toast.error('Erro ao buscar CEP');
    }
  }

  function handleNext() {
    if (validateStep(step)) setStep(s => Math.min(steps.length - 1, s + 1));
  }

  function handlePrev() {
    setStep(s => Math.max(0, s - 1));
  }

  function resetForm() {
    setFormData({ status: 'active' });
    setAddress({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' });
    setStep(0);
    setErrors({});
  }

  function formatDateInput(date: Date | string) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    step,
    setStep,
    steps,
    address,
    setAddress,
    validateCPF,
    formatCPF,
    maskPhone,
    validatePhone,
    formatCEP,
    formatPhone,
    searchCEP,
    validateStep,
    validateEditForm,
    fetchAddressByCep,
    handleNext,
    handlePrev,
    resetForm,
    formatDateInput,
    handleNextStep,
    handlePreviousStep
  };
} 