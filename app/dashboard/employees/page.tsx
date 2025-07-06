'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  Download,
  Mail,
  Phone,
  Shield,
  Settings,
  Trash2,
  UserPlus,
  FileText,
  Calendar,
  Building,
  MapPin,
  Clock,
  X,
  Check,
  Save,
  User as UserIcon,
  Briefcase as BriefcaseIcon,
  Image as ImageIcon,
  Upload
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockEmployees, Employee, mockContracts } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import { 
  getCurrentUser, 
  getUserPermissions, 
  getAccessibleContracts, 
  canUserAccessContract,
  validateUserAccess,
  User,
  UserRole
} from '@/lib/auth'
import { useTranslations } from 'next-intl'
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getEmployees } from '@/lib/employeeService'
import { useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useAddAdmission, useAddDismissal } from '@/lib/useCreateEmployee'
import { useEmployeesQuery } from '@/lib/useEmployeesQuery'
import Papa from 'papaparse';

// Configuração das colunas disponíveis
interface ColumnConfig {
  key: string
  label: string
  enabled: boolean
  width?: string
}

export default function EmployeesPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [columns, setColumns] = useState<ColumnConfig[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({ status: 'active' })
  const [step, setStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const t = useTranslations('employees');
  const steps = [
    t('form.steps.0'),
    t('form.steps.endereco'),
    t('form.steps.1'),
    t('form.steps.2'),
    t('form.steps.3'),
  ];
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [address, setAddress] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });
  const [cepError, setCepError] = useState('');
  const [cepSuccess, setCepSuccess] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterContract, setFilterContract] = useState('')
  const [filterFunction, setFilterFunction] = useState('')
  const [filterAdmission, setFilterAdmission] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterDismissal, setFilterDismissal] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState<Employee | null>(null);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [showDismissalForm, setShowDismissalForm] = useState(false);
  const [admissionContractId, setAdmissionContractId] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [dismissalDate, setDismissalDate] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [historySuccess, setHistorySuccess] = useState('');
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  const addAdmissionMutation = useAddAdmission();
  const addDismissalMutation = useAddDismissal();
  const { data: employees = [], isLoading: isEmployeesLoading, isError: isEmployeesError, refetch } = useEmployeesQuery();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedEmployees, setImportedEmployees] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importCancelled, setImportCancelled] = useState(false);

  // Dentro do componente EmployeesPage, após obter t:
  const defaultColumns: ColumnConfig[] = [
    { key: 'name', label: t('form.name'), enabled: true, width: '180px' },
    { key: 'cpf', label: t('form.cpf'), enabled: true, width: '150px' },
    { key: 'matricula', label: t('form.matricula'), enabled: true, width: '90px' },
    { key: 'cargo', label: t('form.cargo'), enabled: true, width: '150px' },
    { key: 'status', label: t('form.status'), enabled: true, width: '90px' },
    { key: 'cidade', label: t('form.cidade'), enabled: true, width: '110px' },
    { key: 'telefone', label: t('form.phone'), enabled: false, width: '110px' },
    { key: 'dataEntrada', label: t('form.data_entrada'), enabled: true, width: '150px' },
    { key: 'contrato', label: t('form.contract'), enabled: true, width: '110px' },
    { key: 'centroCusto', label: t('form.centroCusto'), enabled: true, width: '150px' },
    { key: 'turno', label: t('form.turno'), enabled: false, width: '80px' },
    { key: 'obra', label: t('form.obra'), enabled: false, width: '100px' },
    { key: 'primeiraExperiencia', label: t('form.primeira_experiencia'), enabled: false, width: '110px' },
    { key: 'segundaExperiencia', label: t('form.segunda_experiencia'), enabled: false, width: '110px' },
    { key: 'previsaoObra', label: t('form.previsao_obra'), enabled: false, width: '100px' },
    { key: 'mo', label: 'Tipo de Mão de Obra', enabled: true, width: '130px' },
    { key: 'horasNormaisTrabalhadas', label: 'Horas Normais Trabalhadas', enabled: false, width: '120px' },
    { key: 'horasExtrasTrabalhadas', label: 'Horas Extras Trabalhadas', enabled: false, width: '120px' },
    { key: 'horasNoturnasTrabalhadas', label: 'Horas Noturnas Trabalhadas', enabled: false, width: '120px' },
    { key: 'localAlojado', label: 'Local/Alojamento', enabled: false, width: '100px' },
    { key: 'bairro', label: 'Bairro', enabled: false, width: '90px' },
    { key: 'pontoReferencia', label: 'Ponto de Referência', enabled: false, width: '120px' },
    { key: 'statusBancodoc', label: 'Status Bancário/Documental', enabled: false, width: '120px' },
    { key: 'efetivoRDO', label: 'Efetivo Apontado em RDO', enabled: false, width: '120px' },
    { key: 'dismissalDate', label: t('form.data_demissao') || 'Data de Demissão', enabled: false, width: '110px' },
  ];

  // Inicializar usuário e permissões
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)
    
    // Buscar funcionários via service
    getEmployees().then((allEmployees) => {
      const accessibleEmployees = allEmployees.filter(employee => {
        if (!employee.currentContractId || !employee.isActive) return false
        return canUserAccessContract(user, employee.currentContractId)
      })
      // Remover: setEmployees(accessibleEmployees)
      // Se necessário, use accessibleEmployees para lógica local
    })

    // Carregar configuração de colunas salva
    const savedColumns = localStorage.getItem('employee-columns')
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns))
      } catch (error) {
        console.error('Erro ao carregar configuração de colunas:', error)
      }
    } else {
      setColumns(defaultColumns)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  useEffect(() => {
    if (showEditModal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [showEditModal]);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.cpf.includes(searchTerm) ||
      employee.currentContract?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesContract = !filterContract || employee.currentContractId === filterContract;
    const matchesFunction = !filterFunction || employee.currentFunctionId === filterFunction;
    const matchesAdmission = !filterAdmission || (employee.admissionDate && formatDateInput(employee.admissionDate) === filterAdmission);
    const matchesCity = !filterCity || (employee.cidade && employee.cidade.toLowerCase().includes(filterCity.toLowerCase()));
    const matchesDismissal = !filterDismissal || (employee.dismissalDate && formatDateInput(employee.dismissalDate) === filterDismissal);

    return matchesSearch && matchesStatus && matchesContract && matchesFunction && matchesAdmission && matchesCity && matchesDismissal;
  });

    const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'on_leave': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'transferred': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'on_leave': return 'Em Licença'
      case 'transferred': return 'Transferido'
      case 'dismissed': return 'Demitido'
      default: return status
    }
  }

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSelectAll = () => {
    setSelectedEmployees(
      selectedEmployees.length === filteredEmployees.length 
        ? [] 
        : filteredEmployees.map(e => e.id)
    )
  }

  const handleColumnToggle = (columnKey: string) => {
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, enabled: !col.enabled } : col
    )
    setColumns(updatedColumns)
    localStorage.setItem('employee-columns', JSON.stringify(updatedColumns))
  }

  function validateCPF(cpf: string) {
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

  function maskPhone(phone: string) {
    return phone
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }

  function validateStep(currentStep: number) {
    const newErrors: { [key: string]: string } = {};
    if (currentStep === 0) {
      if (!newEmployee.name) newErrors.name = t('form.error.name_required');
      if (!newEmployee.cpf) newErrors.cpf = t('form.error.cpf_required');
      else if (!validateCPF(newEmployee.cpf)) newErrors.cpf = t('form.error.cpf_invalid');
      if (!newEmployee.phone) newErrors.phone = 'Telefone obrigatório';
      else if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(maskPhone(newEmployee.phone))) newErrors.phone = 'Telefone inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) setStep(s => Math.min(steps.length - 1, s + 1));
  }
  function handlePrev() {
    setStep(s => Math.max(0, s - 1));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep(step)) {
      if (step === steps.length - 1) {
        handleAddEmployee();
      } else {
        setStep(s => Math.min(steps.length - 1, s + 1));
      }
    }
  }

  const handleAddEmployee = async () => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return;
    if (
      employees.some(
        emp =>
          emp.cpf.replace(/\D/g, '') === newEmployee.cpf?.replace(/\D/g, '') &&
          emp.status !== 'dismissed'
      )
    ) {
      setErrors(prev => ({ ...prev, cpf: 'CPF já cadastrado para outro funcionário ativo' }));
      toast.error(t('form.error.cpf_duplicate', { default: 'Já existe um colaborador ativo com este CPF!' }));
      return;
    }
    // Montar payload para o backend (adequado para todos os campos obrigatórios)
    const employeePayload = {
      name: newEmployee.name || "",
      registration: newEmployee.registration || "",
      role: newEmployee.role || "",
      category: newEmployee.category || "",
      company: newEmployee.company || "",
      cpf: (newEmployee.cpf || "").replace(/\D/g, ""),
      rg: newEmployee.rg || "",
      birthDate: newEmployee.birthDate || "",
      admissionDate: newEmployee.admissionDate || "",
      dismissalDate: newEmployee.dismissalDate || "",
      status: newEmployee.status || "",
      workplace: newEmployee.workplace || "",
      shift: newEmployee.shift || "",
      phone: (newEmployee.phone || "").replace(/\D/g, ""),
      address: {
        cep: address.cep || "",
        logradouro: address.logradouro || "",
        numero: address.numero || "",
        complemento: address.complemento || "",
        bairro: address.bairro || "",
        cidade: address.cidade || "",
        uf: address.uf || ""
      },
      nationality: newEmployee.nationality || "",
      gender: newEmployee.gender || "",
      maritalStatus: newEmployee.maritalStatus || "",
      pis: newEmployee.pis || "",
      ctps: newEmployee.ctps || "",
      ctpsSeries: newEmployee.ctpsSeries || "",
      ctpsUf: newEmployee.ctpsUf || "",
      motherName: newEmployee.motherName || "",
      dependents: Array.isArray(newEmployee.dependents) ? newEmployee.dependents : [],
      notes: newEmployee.notes || "",
      avatar: newEmployee.avatar || null
    };
    console.log('[CADASTRO FUNCIONÁRIO] Payload enviado:', JSON.stringify(employeePayload, null, 2));
    createEmployeeMutation.mutate(employeePayload, {
      onSuccess: () => {
        setShowAddModal(false);
        setNewEmployee({ status: 'active' });
        setAddress({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' });
        setStep(0);
        setErrors({});
        toast.success(t('form.success', { default: 'Funcionário cadastrado com sucesso!' }));
      },
      onError: (error: any) => {
        toast.error(t('form.error.generic', { default: 'Erro ao cadastrar funcionário.' }));
      },
    });
  };

  const handleEditEmployee = (e) => {
    e.preventDefault();
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES') || !selectedEmployee) return;
    updateEmployeeMutation.mutate(
      { id: selectedEmployee.id, updates: selectedEmployee },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedEmployee(null);
          toast.success(t('form.edit_success', { default: 'Alterações salvas com sucesso!' }));
        },
        onError: () => {
          toast.error(t('form.error.generic', { default: 'Erro ao salvar alterações.' }));
        },
      }
    );
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return;
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      deleteEmployeeMutation.mutate(
        employeeId,
        {
          onSuccess: () => {
            toast.success(t('form.delete_success', { default: 'Funcionário excluído com sucesso!' }));
          },
          onError: () => {
            toast.error(t('form.error.generic', { default: 'Erro ao excluir funcionário.' }));
          },
        }
      );
    }
  };

  const handleBulkDelete = () => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return;
    if (confirm(`Tem certeza que deseja excluir ${selectedEmployees.length} funcionários selecionados?`)) {
      selectedEmployees.forEach((id) => {
        deleteEmployeeMutation.mutate(id, {
          onSuccess: () => {},
          onError: () => {},
        });
      });
      setSelectedEmployees([]);
      toast.success(t('form.delete_success', { default: 'Funcionários excluídos com sucesso!' }));
    }
  };

  const handleExport = () => {
    console.log('Exportar CSV clicado')
    const exportColumns = columns.filter(col => col.enabled)
    const exportRows = filteredEmployees
    const csv = toCSV(exportRows, exportColumns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, 'funcionarios.csv')
    toast.success('Exportação concluída!')
  }

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.TENANT_ADMIN: return 'Admin Geral'
      case UserRole.CONTRACT_MANAGER: return 'Gerente de Contrato'
      case UserRole.HR: return 'Recursos Humanos'
      case UserRole.PLANNING: return 'Planejamento'
      case UserRole.SAFETY: return 'Segurança'
      case UserRole.SUPERVISOR: return 'Supervisor'
      case UserRole.OPERATOR: return 'Operador'
      default: return role
    }
  }

  const enabledColumns = columns.filter(col => col.enabled)

  const renderCellContent = (employee: Employee, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              {employee.avatar ? (
                <img 
                  src={employee.avatar} 
                  alt={employee.name} 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{employee.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {employee.email && (
                  <div className="tooltip" data-tip={employee.email}>
                    <Mail className="h-3 w-3 text-gray-400 dark:text-slate-500" />
              </div>
                )}
                {employee.phone && (
                  <div className="tooltip" data-tip={employee.phone}>
                    <Phone className="h-3 w-3 text-gray-400 dark:text-slate-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      case 'cpf':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.cpf}</span>
      case 'matricula':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.id.padStart(6, '0')}</span>
      case 'cargo':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.currentFunction || 'Não atribuído'}</span>
      case 'status':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
            {getStatusLabel(employee.status)}
          </span>
        )
      case 'cidade':
        return <span className="text-sm text-gray-900 dark:text-slate-100">São Paulo</span>
      case 'telefone':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.phone || '-'}</span>
      case 'dataEntrada':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{formatDate(employee.admissionDate)}</span>
      case 'contrato':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.currentContract || 'Não atribuído'}</span>
      case 'centroCusto':
        return <span className="text-sm text-gray-900 dark:text-slate-100">CC-{Math.floor(Math.random() * 1000)}</span>
      case 'turno':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Diurno</span>
      case 'obra':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Obra A</span>
      case 'primeiraExperiencia':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Construção Civil</span>
      case 'segundaExperiencia':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Soldagem</span>
      case 'previsaoObra':
        return <span className="text-sm text-gray-900 dark:text-slate-100">12 meses</span>
      case 'mo':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.mo || '-'}</span>
      case 'horasNormaisTrabalhadas':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.horasNormaisTrabalhadas ?? '-'}</span>
      case 'horasExtrasTrabalhadas':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.horasExtrasTrabalhadas ?? '-'}</span>
      case 'horasNoturnasTrabalhadas':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.horasNoturnasTrabalhadas ?? '-'}</span>
      case 'localAlojado':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.localAlojado || '-'}</span>
      case 'bairro':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.address?.bairro || '-'}</span>
      case 'pontoReferencia':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.pontoReferencia || '-'}</span>
      case 'statusBancodoc':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.statusBancodoc || '-'}</span>
      case 'efetivoRDO':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.efetivoRDO ? 'Sim' : 'Não'}</span>
      case 'dismissalDate':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.dismissalDate ? formatDateInput(employee.dismissalDate) : '-'}</span>
      default:
        return <span className="text-sm text-gray-500 dark:text-slate-400">-</span>
    }
  }

  // Função para buscar endereço pelo CEP
  async function fetchAddressByCep(cep: string) {
    setCepError('');
    setCepSuccess(false);
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setCepError('CEP deve ter 8 dígitos');
      return;
    }
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          uf: data.uf || ''
        }));
        setCepSuccess(true);
      } else {
        setCepError('CEP não encontrado');
      }
    } catch (e) {
      setCepError('Erro ao buscar CEP');
    }
  }

  // Função para exportar XLSX
  const handleExportXLSX = () => {
    console.log('Exportar XLSX clicado')
    const exportColumns = columns.filter(col => col.enabled)
    const exportRows = filteredEmployees.map(row => {
      const obj: any = {}
      exportColumns.forEach(col => {
        obj[col.label] = row[col.key]
      })
      return obj
    })
    // Obter logo e nome da empresa
    const logo = currentUser?.companyLogo || '/logo-default.png'
    const companyName = currentUser?.name || 'Empresa'
    const ws = XLSX.utils.json_to_sheet(exportRows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Funcionários')
    // Adicionar logo como texto (XLSX não suporta imagem nativamente sem libs extras)
    XLSX.utils.sheet_add_aoa(ws, [[`Logo: ${logo}`]], { origin: 'A1' })
    XLSX.utils.sheet_add_aoa(ws, [[`Empresa: ${companyName}`]], { origin: 'A2' })
    XLSX.writeFile(wb, 'funcionarios.xlsx')
    toast.success('Exportação XLSX concluída!')
  }

  // Função para exportar PDF
  const handleExportPDF = () => {
    console.log('Exportar PDF clicado')
    const exportColumns = columns.filter(col => col.enabled)
    const doc = new jsPDF({ orientation: 'landscape' })
    // ATENÇÃO: coloque um arquivo logo-default.png na pasta public para evitar erro 404
    const logo = currentUser?.companyLogo || '/logo-default.png'
    const companyName = currentUser?.name || 'Empresa'
    // Tentar inserir imagem se for URL relativa ou base64
    if (logo && (logo.startsWith('data:image') || logo.endsWith('.png') || logo.endsWith('.jpg') || logo.endsWith('.jpeg'))) {
      try {
        doc.addImage(logo, 'PNG', 14, 6, 32, 16)
      } catch (e) {
        doc.setFontSize(10)
        doc.text(`Logo: ${logo}`, 14, 14)
      }
      doc.setFontSize(14)
      doc.text(companyName, 50, 16)
    } else {
      doc.setFontSize(14)
      doc.text(companyName, 14, 14)
    }
    doc.text('Funcionários', 14, 28)
    const tableData = filteredEmployees.map(row => exportColumns.map(col => row[col.key] ?? ''))
    autoTable(doc, {
      head: [exportColumns.map(col => col.label)],
      body: tableData,
      startY: 34,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 }
    })
    doc.save('funcionarios.pdf')
    toast.success('Exportação PDF concluída!')
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedEmployee(prev => prev ? { ...prev, avatar: ev.target?.result as string } : prev);
    };
    reader.readAsDataURL(file);
  }

  function formatDateInput(date: Date | string) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  function handleNewAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewEmployee(prev => ({ ...prev, avatar: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }

  // Adicionar dentro do componente EmployeesPage, antes do uso:
  function toCSV(rows: any[], columns: ColumnConfig[]) {
    const header = columns.map(col => col.label).join(',')
    const data = rows.map(row => columns.map(col => {
      let value = row[col.key]
      if (typeof value === 'string') value = '"' + value.replace(/"/g, '""') + '"'
      return value ?? ''
    }).join(','))
    return [header, ...data].join('\n')
  }

  // Função para abrir o modal de histórico
  const openHistoryModal = (employee: Employee) => {
    setHistoryEmployee(employee);
    setShowHistoryModal(true);
  };
  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setHistoryEmployee(null);
  };

  const handleAddAdmission = () => {
    setHistoryError('');
    setHistorySuccess('');
    if (!admissionContractId || !admissionDate) {
      setHistoryError(t('history.admission_required', { default: 'Contrato e data são obrigatórios.' }));
      return;
    }
    const contract = mockContracts.find(c => c.id === admissionContractId);
    if (!contract || !historyEmployee) {
      setHistoryError(t('history.contract_not_found', { default: 'Contrato não encontrado.' }));
      return;
    }
    addAdmissionMutation.mutate(
      {
        id: historyEmployee.id,
        admission: {
          contractId: contract.id,
          contractName: contract.name,
          admissionDate: admissionDate,
        },
      },
      {
        onSuccess: () => {
          setShowAdmissionForm(false);
          setAdmissionContractId('');
          setAdmissionDate('');
          setHistorySuccess(t('history.admission_success', { default: 'Nova admissão registrada com sucesso.' }));
        },
        onError: () => {
          setHistoryError(t('form.error.generic', { default: 'Erro ao registrar admissão.' }));
        },
      }
    );
  };

  const handleAddDismissal = () => {
    setHistoryError('');
    setHistorySuccess('');
    if (!dismissalDate) {
      setHistoryError(t('history.dismissal_required', { default: 'Data de demissão é obrigatória.' }));
      return;
    }
    if (!historyEmployee?.employmentHistory || historyEmployee.employmentHistory.length === 0) {
      setHistoryError(t('history.no_admission', { default: 'Nenhuma admissão encontrada.' }));
      return;
    }
    const lastIdx = historyEmployee.employmentHistory.length - 1;
    if (historyEmployee.employmentHistory[lastIdx].dismissalDate) {
      setHistoryError(t('history.already_dismissed', { default: 'O último vínculo já está encerrado.' }));
      return;
    }
    addDismissalMutation.mutate(
      {
        id: historyEmployee.id,
        dismissalDate: dismissalDate,
      },
      {
        onSuccess: () => {
          setShowDismissalForm(false);
          setDismissalDate('');
          setHistorySuccess(t('history.dismissal_success', { default: 'Demissão registrada com sucesso.' }));
        },
        onError: () => {
          setHistoryError(t('form.error.generic', { default: 'Erro ao registrar demissão.' }));
        },
      }
    );
  };

  // Função para processar arquivo
  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv' || ext === 'txt') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setImportedEmployees(results.data);
        },
      });
    } else if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          setImportedEmployees(Array.isArray(data) ? data : [data]);
        } catch {
          toast.error('JSON inválido');
        }
      };
      reader.readAsText(file);
    } else {
      toast.error('Formato não suportado. Use CSV, TXT ou JSON.');
    }
  }

  async function handleImportSubmit() {
    setImportLoading(true);
    setImportResults([]);
    setImportProgress(0);
    setImportCancelled(false);
    const total = importedEmployees.length;
    const results: any[] = [];
    for (let i = 0; i < total; i++) {
      if (importCancelled) break;
      try {
        const res = await fetch('/api/employees/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([importedEmployees[i]]),
        });
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          results.push(data.results[0]);
        } else {
          results.push({ index: i, status: 'error', errors: { general: 'Erro desconhecido' } });
        }
      } catch {
        results.push({ index: i, status: 'error', errors: { general: 'Erro de rede' } });
      }
      setImportProgress(i + 1);
    }
    setImportResults(results);
    setImportLoading(false);
    if (importCancelled) {
      toast('Importação cancelada pelo usuário.', { icon: '⏹️' });
    }
  }

  if (!currentUser || !userPermissions || isEmployeesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loader mr-2"></span> {t('loading', { default: 'Carregando funcionários...' })}
      </div>
    );
  }
  if (isEmployeesError) {
    return (
      <div className="flex items-center justify-center h-96 text-red-600">
        <X className="h-5 w-5 mr-2" /> {t('error', { default: 'Erro ao carregar funcionários.' })}
        <Button variant="outline" size="sm" className="ml-4" onClick={() => refetch()}>{t('retry', { default: 'Tentar novamente' })}</Button>
      </div>
    );
  }
  return (
    <>
      <Toaster position="top-center" />
    <div className="space-y-6">
      {/* Header com Informações de Permissão */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Funcionários</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600 dark:text-slate-400">Gerencie sua força de trabalho e informações dos funcionários</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {getRoleDisplayName(currentUser.role)}
              </span>
              {!userPermissions.canViewAllContracts && (
                <span className="text-xs text-blue-700 dark:text-blue-400">
                  ({userPermissions.allowedContracts.length} contrato{userPermissions.allowedContracts.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar em Massa
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowColumnConfig(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Colunas
          </Button>
          <div className="dropdown dropdown-end relative" ref={exportMenuRef}>
            <Button
              variant="outline"
              size="sm"
              tabIndex={0}
              aria-haspopup="menu"
              aria-expanded={showExportMenu}
              aria-label="Abrir opções de exportação"
              className="flex items-center gap-2"
              onClick={() => setShowExportMenu((v) => !v)}
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="font-semibold">Exportar</span>
          </Button>
            {showExportMenu && (
              <ul
                role="menu"
                aria-label="Exportar dados"
                className="absolute left-0 mt-2 menu p-2 space-y-1 shadow-xl bg-white dark:bg-slate-800 rounded-xl w-52 z-[9999] border border-gray-200 dark:border-slate-700 animate-fade-in"
                style={{ minWidth: '12rem' }}
              >
                <li role="menuitem">
                  <button
                    type="button"
                    onClick={() => { handleExport(); setShowExportMenu(false) }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md bg-base-100 dark:bg-slate-800 appearance-none border-none focus:outline-none hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-100 dark:focus:bg-blue-900/40 transition-colors cursor-pointer text-gray-800 dark:text-slate-100"
                  >
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Exportar CSV
                  </button>
                </li>
                <li role="menuitem">
                  <button
                    type="button"
                    onClick={() => { handleExportXLSX(); setShowExportMenu(false) }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md bg-base-100 dark:bg-slate-800 appearance-none border-none focus:outline-none hover:bg-green-50 dark:hover:bg-green-900/30 focus:bg-green-100 dark:focus:bg-green-900/40 transition-colors cursor-pointer text-gray-800 dark:text-slate-100"
                  >
                    <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Exportar XLSX
                  </button>
                </li>
                <li role="menuitem">
                  <button
                    type="button"
                    onClick={() => { handleExportPDF(); setShowExportMenu(false) }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md bg-base-100 dark:bg-slate-800 appearance-none border-none focus:outline-none hover:bg-red-50 dark:hover:bg-red-900/30 focus:bg-red-100 dark:focus:bg-red-900/40 transition-colors cursor-pointer text-gray-800 dark:text-slate-100"
                  >
                    <Download className="h-4 w-4 text-red-600 dark:text-red-400" />
                    Exportar PDF
                  </button>
                </li>
              </ul>
            )}
          </div>
          {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Funcionário
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Funcionários', value: employees.length, color: 'blue' },
          { label: 'Ativos', value: employees.filter(e => e.status === 'active').length, color: 'green' },
          { label: 'Em Licença', value: employees.filter(e => e.status === 'on_leave').length, color: 'yellow' },
          { label: 'Contratações Recentes', value: 2, color: 'purple' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
              <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                    <Users className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center md:items-end">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar funcionários por nome, CPF ou contrato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="on_leave">Em Licença</option>
                <option value="transferred">Transferido</option>
                <option value="dismissed">Demitido</option>
              </select>
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
                </Button>
                {showFilters && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{t('filters.advanced')}</h3>
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                          <X className="h-4 w-4" />
              </Button>
                      </div>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          setShowFilters(false);
                        }}
                        className="space-y-4"
                      >
                        {/* Contrato */}
                        <div>
                          <label htmlFor="filter-contract" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('form.contract')}</label>
                          <select
                            id="filter-contract"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                            value={filterContract}
                            onChange={e => { setFilterContract(e.target.value); setFilterFunction(''); }}
                          >
                            <option value="">{t('filters.all_contracts')}</option>
                            {mockContracts.map(contract => (
                              <option key={contract.id} value={contract.id}>{contract.name}</option>
                            ))}
                          </select>
                        </div>
                        {/* Função */}
                        <div>
                          <label htmlFor="filter-function" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('form.cargo')}</label>
                          <select
                            id="filter-function"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                            value={filterFunction}
                            onChange={e => setFilterFunction(e.target.value)}
                            disabled={!filterContract}
                          >
                            <option value="">{t('filters.all_functions')}</option>
                            {filterContract && mockContracts.find(c => c.id === filterContract)?.functions.map(func => (
                              <option key={func.id} value={func.id}>{func.name}</option>
                            ))}
                          </select>
                        </div>
                        {/* Data de Admissão */}
                        <div>
                          <label htmlFor="filter-admission" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('form.data_entrada')}</label>
                          <input
                            id="filter-admission"
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                            value={filterAdmission}
                            onChange={e => setFilterAdmission(e.target.value)}
                          />
                        </div>
                        {/* Cidade */}
                        <div>
                          <label htmlFor="filter-city" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('form.cidade')}</label>
                          <input
                            id="filter-city"
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                            value={filterCity}
                            onChange={e => setFilterCity(e.target.value)}
                            placeholder={t('form.cidade')}
                          />
                        </div>
                        {/* Data de Demissão */}
                        <div>
                          <label htmlFor="filter-dismissal" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('form.data_demissao')}</label>
                          <input
                            id="filter-dismissal"
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                            value={filterDismissal}
                            onChange={e => setFilterDismissal(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-between gap-2 mt-6">
                          <Button type="button" variant="secondary" onClick={() => { setFilterContract(''); setFilterFunction(''); setFilterAdmission(''); setFilterCity(''); setFilterDismissal(''); }}>
                            {t('filters.clear')}
                          </Button>
                          <Button type="submit" variant="primary">
                            {t('filters.apply')}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Funcionários ({filteredEmployees.length})
              </CardTitle>
              {selectedEmployees.length > 0 && validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-slate-400">
                    {selectedEmployees.length} selecionados
                  </span>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Selecionados
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                      <th className="text-left p-4">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.length === filteredEmployees.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                        />
                      </th>
                    )}
                    {enabledColumns.map((column) => (
                      <th 
                        key={column.key} 
                        style={{ width: column.width }}
                        data-tip={
                          column.key === 'name' ? 'Nome completo do funcionário' :
                          column.key === 'cpf' ? 'CPF do funcionário' :
                          column.key === 'matricula' ? 'Matrícula interna do funcionário' :
                          column.key === 'cargo' ? 'Cargo/Função atual' :
                          column.key === 'status' ? 'Status atual do vínculo' :
                          column.key === 'cidade' ? 'Cidade de atuação' :
                          column.key === 'dataEntrada' ? 'Data de admissão' :
                          column.key === 'contrato' ? 'Contrato principal' :
                          column.key === 'dismissalDate' ? 'Data de demissão/desligamento' :
                          undefined
                        }
                        className={
                          [
                            'text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300',
                            'tooltip'
                          ].join(' ')
                        }
                      >
                        {column.label}
                      </th>
                    ))}
                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                      {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={() => handleSelectEmployee(employee.id)}
                            className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                          />
                        </td>
                      )}
                      {enabledColumns.map((column) => (
                        <td key={column.key} className="p-4">
                          {renderCellContent(employee, column.key)}
                        </td>
                      ))}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="tooltip" data-tip="Visualizar detalhes do funcionário">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedEmployee(employee); setShowViewModal(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          </div>
                          <div className="tooltip" data-tip={t('actions.edit') || 'Editar informações do funcionário'}>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedEmployee(employee); setShowEditModal(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                          </div>
                          <div className="tooltip" data-tip="Mais ações">
                          <Button variant="ghost" size="sm" onClick={() => openHistoryModal(employee)}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Column Configuration Modal */}
      {showColumnConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Configurar Colunas</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowColumnConfig(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{column.label}</span>
                  <button
                    onClick={() => handleColumnToggle(column.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      column.enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        column.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowColumnConfig(false)}>
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            aria-modal="true"
            role="dialog"
          >
            <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{t('form.title')}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                    onClick={() => { setShowAddModal(false); toast('Cadastro cancelado', { icon: '🛑' }) }}
                    aria-label={t('form.close')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
                <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-left text-gray-900 dark:text-slate-100">
                      {steps[step]}
                    </h4>
                  </div>
                  <motion.div
                    key={step}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40, opacity: 0 }}
                    transition={{ duration: 0.3, type: errors && Object.keys(errors).length ? 'spring' : 'tween', bounce: errors && Object.keys(errors).length ? 0.5 : 0 }}
                  >
                  {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="name">{t('form.name')} *</label>
                        <input id="name" type="text" required value={newEmployee.name || ''} onChange={e => setNewEmployee(prev => ({ ...prev, name: e.target.value }))} className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${errors.name ? 'border-red-500 animate-shake' : ''}`} aria-invalid={!!errors.name} aria-describedby="name-error" autoFocus={!!errors.name} />
                        {errors.name && <span id="name-error" className="text-xs text-red-500 mt-1">{errors.name}</span>}
                </div>
                <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="cpf">{t('form.cpf')} *</label>
                        <input id="cpf" type="text" required value={newEmployee.cpf || ''} onChange={e => setNewEmployee(prev => ({ ...prev, cpf: e.target.value }))} className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${errors.cpf ? 'border-red-500 animate-shake' : ''}`} aria-invalid={!!errors.cpf} aria-describedby="cpf-error" maxLength={14} />
                        {errors.cpf && <span id="cpf-error" className="text-xs text-red-500 mt-1">{errors.cpf}</span>}
                </div>
                <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="matricula">{t('form.matricula')}</label>
                        <input id="matricula" type="text" value={newEmployee.registration || ''} onChange={e => setNewEmployee(prev => ({ ...prev, registration: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
                </div>
                <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="cidade">{t('form.cidade')}</label>
                        <input id="cidade" type="text" value={newEmployee.address?.cidade || ''} onChange={e => setNewEmployee(prev => ({ ...prev, address: { ...prev.address, cidade: e.target.value } }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
                </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="phone">{t('form.phone')}</label>
                        <input id="phone" type="tel" value={maskPhone(newEmployee.phone || '')} onChange={e => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" maxLength={15} />
                      </div>
                    </div>
                  )}
                  {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="cep">CEP *</label>
                        <input id="cep" type="text" value={address.cep} onChange={e => {
                          setAddress(prev => ({ ...prev, cep: e.target.value }));
                          setCepError(''); setCepSuccess(false);
                          if (e.target.value.replace(/\D/g, '').length === 8) fetchAddressByCep(e.target.value);
                        }} className={`w-full px-3 py-2 border ${errors.cep ? 'border-red-500' : cepSuccess ? 'border-green-500' : 'border-gray-300'} dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100`} maxLength={9} />
                        {errors.cep && <span className="text-xs text-red-500 mt-1">{errors.cep}</span>}
                        {cepSuccess && !errors.cep && <span className="text-xs text-green-600 mt-1">Endereço preenchido automaticamente!</span>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="logradouro">Logradouro *</label>
                        <input id="logradouro" type="text" value={address.logradouro} onChange={e => setAddress(prev => ({ ...prev, logradouro: e.target.value }))} className={`w-full px-3 py-2 border ${errors.logradouro ? 'border-red-500' : 'border-gray-300'} dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100`} />
                        {errors.logradouro && <span className="text-xs text-red-500 mt-1">{errors.logradouro}</span>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="numero">Número *</label>
                        <input id="numero" type="text" value={address.numero} onChange={e => setAddress(prev => ({ ...prev, numero: e.target.value }))} className={`w-full px-3 py-2 border ${errors.numero ? 'border-red-500' : 'border-gray-300'} dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100`} />
                        {errors.numero && <span className="text-xs text-red-500 mt-1">{errors.numero}</span>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="complemento">Complemento</label>
                        <input id="complemento" type="text" value={address.complemento} onChange={e => setAddress(prev => ({ ...prev, complemento: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="bairro">Bairro *</label>
                        <input id="bairro" type="text" value={address.bairro} onChange={e => setAddress(prev => ({ ...prev, bairro: e.target.value }))} className={`w-full px-3 py-2 border ${errors.bairro ? 'border-red-500' : 'border-gray-300'} dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100`} />
                        {errors.bairro && <span className="text-xs text-red-500 mt-1">{errors.bairro}</span>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="cidade">Cidade *</label>
                        <input id="cidade" type="text" value={address.cidade} onChange={e => setAddress(prev => ({ ...prev, cidade: e.target.value }))} className={`w-full px-3 py-2 border ${errors.cidade ? 'border-red-500' : 'border-gray-300'} dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100`} />
                        {errors.cidade && <span className="text-xs text-red-500 mt-1">{errors.cidade}</span>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="uf">UF *</label>
                        <input id="uf" type="text" value={address.uf} onChange={e => setAddress(prev => ({ ...prev, uf: e.target.value }))} className={`w-full px-3 py-2 border ${errors.uf ? 'border-red-500' : 'border-gray-300'} dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100`} maxLength={2} />
                        {errors.uf && <span className="text-xs text-red-500 mt-1">{errors.uf}</span>}
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="cargo">{t('form.cargo')} *</label>
                        <input id="cargo" type="text" value={newEmployee.cargo || ''} onChange={e => setNewEmployee(prev => ({ ...prev, cargo: e.target.value }))} className={`w-full px-3 py-2 border ${errors.cargo ? 'border-red-500' : 'border-gray-300'} dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100`} />
                        {errors.cargo && <span className="text-xs text-red-500 mt-1">{errors.cargo}</span>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="centroCusto">{t('form.centroCusto')}</label>
                        <input id="centroCusto" type="text" value={newEmployee.centroCusto || ''} onChange={e => setNewEmployee(prev => ({ ...prev, centroCusto: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="turno">{t('form.turno')}</label>
                        <input id="turno" type="text" value={newEmployee.turno || ''} onChange={e => setNewEmployee(prev => ({ ...prev, turno: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="obra">{t('form.obra')}</label>
                        <input id="obra" type="text" value={newEmployee.obra || ''} onChange={e => setNewEmployee(prev => ({ ...prev, obra: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="currentContractId">{t('form.contract')} *</label>
                        <select id="currentContractId" value={newEmployee.currentContractId || ''} onChange={e => setNewEmployee(prev => ({ ...prev, currentContractId: e.target.value }))} className={`w-full px-3 py-2 border ${errors.currentContractId ? 'border-red-500' : 'border-gray-300'} dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100`} aria-invalid={!!errors.currentContractId} aria-describedby="contract-error">
                          <option value="">{t('form.select_contract')}</option>
                    {mockContracts.map(contract => (
                            <option key={contract.id} value={contract.id}>{contract.name}</option>
                    ))}
                  </select>
                        {errors.currentContractId && <span id="contract-error" className="text-xs text-red-500 mt-1">{errors.currentContractId}</span>}
                </div>
                <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="dataEntrada">{t('form.data_entrada')} *</label>
                        <input id="dataEntrada" type="date" value={newEmployee.dataEntrada || ''} onChange={e => setNewEmployee(prev => ({ ...prev, dataEntrada: e.target.value }))} className={`w-full px-3 py-2 border ${errors.dataEntrada ? 'border-red-500' : 'border-gray-300'} dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100`} aria-invalid={!!errors.dataEntrada} aria-describedby="data-entrada-error" />
                        {errors.dataEntrada && <span id="data-entrada-error" className="text-xs text-red-500 mt-1">{errors.dataEntrada}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="add-dismissalDate">Data de Demissão</label>
                  <input id="add-dismissalDate" type="date" value={newEmployee.dismissalDate ? formatDateInput(newEmployee.dismissalDate) : ''} onChange={e => {
                    const value = e.target.value ? new Date(e.target.value) : undefined;
                    setNewEmployee(prev => ({
                      ...prev,
                      dismissalDate: value,
                      status: value ? 'dismissed' : prev.status === 'dismissed' ? 'active' : prev.status
                    }));
                  }} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="add-avatar">Foto</label>
                  <input id="add-avatar" type="file" accept="image/*" onChange={handleNewAvatarUpload} className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-100" />
                  {newEmployee.avatar && (
                    <img src={newEmployee.avatar} alt="Avatar" className="mt-2 w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
                  )}
              </div>
              </div>
                  )}
                  {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="primeiraExperiencia">{t('form.primeira_experiencia')}</label>
                        <input id="primeiraExperiencia" type="text" value={newEmployee.primeiraExperiencia || ''} onChange={e => setNewEmployee(prev => ({ ...prev, primeiraExperiencia: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
              </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="segundaExperiencia">{t('form.segunda_experiencia')}</label>
                        <input id="segundaExperiencia" type="text" value={newEmployee.segundaExperiencia || ''} onChange={e => setNewEmployee(prev => ({ ...prev, segundaExperiencia: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
                      </div>
                    </div>
                  )}
                  {step === 4 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="previsaoObra">{t('form.previsao_obra')}</label>
                        <input id="previsaoObra" type="text" value={newEmployee.previsaoObra || ''} onChange={e => setNewEmployee(prev => ({ ...prev, previsaoObra: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2" htmlFor="status">{t('form.status')} *</label>
                        <select id="status" value={newEmployee.status || 'active'} onChange={e => setNewEmployee(prev => ({ ...prev, status: e.target.value as Employee['status'] }))} className={`w-full px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-gray-300'} dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100`} aria-invalid={!!errors.status} aria-describedby="status-error">
                          <option value="active">{t('form.status_active')}</option>
                          <option value="on_leave">{t('form.status_on_leave')}</option>
                          <option value="transferred">{t('form.status_transferred')}</option>
                          <option value="dismissed">{t('form.status_dismissed')}</option>
                        </select>
                        {errors.status && <span id="status-error" className="text-xs text-red-500 mt-1">{errors.status}</span>}
                      </div>
                    </div>
                  )}
                  </motion.div>
                  <div className="flex justify-between mt-8">
                    <Button type="button" variant="secondary" disabled={step === 0 || createEmployeeMutation.isPending} onClick={handlePrev}>{t('form.prev')}</Button>
                    {step < steps.length - 1 ? (
                      <Button type="button" variant="primary" onClick={handleNext} disabled={createEmployeeMutation.isPending}>{t('form.next')}</Button>
                    ) : (
                      <Button type="submit" variant="primary" disabled={createEmployeeMutation.isPending}>
                        {createEmployeeMutation.isPending ? (
                          <span className="flex items-center"><span className="loader mr-2"></span>{t('form.loading', { default: 'Salvando...' })}</span>
                        ) : (
                          <><UserPlus className="h-4 w-4 mr-2" />{t('form.submit')}</>
                        )}
                      </Button>
                    )}
                  </div>
                  {createEmployeeMutation.isError && (
                    <div className="alert alert-error mt-6 flex items-center gap-2" role="alert">
                      <X className="h-5 w-5 text-red-600" /> {t('form.error.generic', { default: 'Erro ao cadastrar funcionário.' })}
                    </div>
                  )}
                  {showSuccess && (
                    <div className="alert alert-success mt-6 flex items-center gap-2" role="status">
                      <Check className="h-5 w-5 text-green-600" /> {t('form.success')}
                    </div>
                  )}
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
        <div className="fixed right-0 z-50 flex pointer-events-none" style={{ top: '4rem', height: 'calc(100vh - 4rem)' }}>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="relative h-full w-full max-w-xl bg-white dark:bg-slate-800 flex flex-col overflow-y-auto pointer-events-auto border-l border-gray-200 dark:border-slate-700"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Editar Funcionário</h3>
              <button onClick={() => setShowEditModal(false)} aria-label="Fechar" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <form className="flex-1 p-6 space-y-8" onSubmit={handleEditEmployee} autoComplete="off">
              {/* Dados Pessoais */}
              <section className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h4 className="text-base font-semibold mb-2 mt-0 text-gray-700 dark:text-slate-200 flex items-center gap-2"><UserIcon className="h-4 w-4 text-blue-400" />Dados Pessoais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-name"><UserIcon className="h-3 w-3 text-gray-300" />Nome *</label>
                    <input id="edit-name" type="text" value={selectedEmployee.name} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, name: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" required />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-cpf"><Shield className="h-3 w-3 text-gray-300" />CPF *</label>
                    <input id="edit-cpf" type="text" value={selectedEmployee.cpf} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, cpf: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" required />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-matricula"><FileText className="h-3 w-3 text-gray-300" />Matrícula</label>
                    <input id="edit-matricula" type="text" value={selectedEmployee.registration || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, registration: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-status"><Check className="h-3 w-3 text-gray-300" />Status</label>
                    <select id="edit-status" value={selectedEmployee.status} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, status: e.target.value as Employee['status'] } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 text-sm bg-white dark:bg-slate-800 transition-colors" required>
                    <option value="active">Ativo</option>
                    <option value="on_leave">Em Licença</option>
                    <option value="transferred">Transferido</option>
                    <option value="dismissed">Demitido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-dismissalDate"><Calendar className="h-3 w-3 text-gray-300" />Data de Demissão</label>
                  <input id="edit-dismissalDate" type="date" value={selectedEmployee.dismissalDate ? formatDateInput(selectedEmployee.dismissalDate) : ''} onChange={e => {
                    const value = e.target.value ? new Date(e.target.value) : undefined;
                    setSelectedEmployee(prev => prev ? {
                      ...prev,
                      dismissalDate: value,
                      status: value ? 'dismissed' : prev.status === 'dismissed' ? 'active' : prev.status
                    } : prev);
                  }} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-avatar"><ImageIcon className="h-3 w-3 text-gray-300" />Foto</label>
                  <input id="edit-avatar" type="file" accept="image/*" onChange={handleAvatarUpload} className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-100" />
                  {selectedEmployee.avatar && (
                    <img src={selectedEmployee.avatar} alt="Avatar" className="mt-2 w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
                  )}
              </div>
                </div>
              </section>
              {/* Contato */}
              <section className="pt-0 pb-4 border-b border-gray-200 dark:border-slate-700">
                <h4 className="text-base font-semibold mb-2 mt-0 text-gray-700 dark:text-slate-200 flex items-center gap-2"><Phone className="h-4 w-4 text-blue-400" />Contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-phone"><Phone className="h-3 w-3 text-gray-300" />Telefone</label>
                    <input id="edit-phone" type="tel" value={selectedEmployee.phone || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, phone: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-email"><Mail className="h-3 w-3 text-gray-300" />E-mail</label>
                    <input id="edit-email" type="email" value={selectedEmployee.email || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, email: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
              </div>
                </div>
              </section>
              {/* Endereço */}
              <section className="pt-0 pb-4 border-b border-gray-200 dark:border-slate-700">
                <h4 className="text-base font-semibold mb-2 mt-0 text-gray-700 dark:text-slate-200 flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-400" />Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-cep"><MapPin className="h-3 w-3 text-gray-300" />CEP</label>
                    <input id="edit-cep" type="text" value={selectedEmployee.endereco?.cep || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, endereco: { ...prev.endereco, cep: e.target.value } } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-logradouro"><Building className="h-3 w-3 text-gray-300" />Logradouro</label>
                    <input id="edit-logradouro" type="text" value={selectedEmployee.endereco?.logradouro || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, endereco: { ...prev.endereco, logradouro: e.target.value } } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-numero"><Building className="h-3 w-3 text-gray-300" />Número</label>
                    <input id="edit-numero" type="text" value={selectedEmployee.endereco?.numero || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, endereco: { ...prev.endereco, numero: e.target.value } } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-complemento"><Building className="h-3 w-3 text-gray-300" />Complemento</label>
                    <input id="edit-complemento" type="text" value={selectedEmployee.endereco?.complemento || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, endereco: { ...prev.endereco, complemento: e.target.value } } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-bairro"><Building className="h-3 w-3 text-gray-300" />Bairro</label>
                    <input id="edit-bairro" type="text" value={selectedEmployee.endereco?.bairro || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, endereco: { ...prev.endereco, bairro: e.target.value } } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-cidade"><Building className="h-3 w-3 text-gray-300" />Cidade</label>
                    <input id="edit-cidade" type="text" value={selectedEmployee.endereco?.cidade || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, endereco: { ...prev.endereco, cidade: e.target.value } } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-uf"><Building className="h-3 w-3 text-gray-300" />UF</label>
                    <input id="edit-uf" type="text" value={selectedEmployee.endereco?.uf || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, endereco: { ...prev.endereco, uf: e.target.value } } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" maxLength={2} />
                  </div>
                </div>
              </section>
              {/* Profissional */}
              <section className="pt-0 pb-4 border-b border-gray-200 dark:border-slate-700">
                <h4 className="text-base font-semibold mb-2 mt-0 text-gray-700 dark:text-slate-200 flex items-center gap-2"><BriefcaseIcon className="h-4 w-4 text-blue-400" />Profissional</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-cargo"><BriefcaseIcon className="h-3 w-3 text-gray-300" />Cargo</label>
                    <input id="edit-cargo" type="text" value={selectedEmployee.cargo || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, cargo: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-turno"><BriefcaseIcon className="h-3 w-3 text-gray-300" />Turno</label>
                    <input id="edit-turno" type="text" value={selectedEmployee.turno || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, turno: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-mo"><BriefcaseIcon className="h-3 w-3 text-gray-300" />Tipo de Mão de Obra</label>
                    <input id="edit-mo" type="text" value={selectedEmployee.mo || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, mo: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-localAlojado"><BriefcaseIcon className="h-3 w-3 text-gray-300" />Local/Alojamento</label>
                    <input id="edit-localAlojado" type="text" value={selectedEmployee.localAlojado || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, localAlojado: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-statusBancodoc"><BriefcaseIcon className="h-3 w-3 text-gray-300" />Status Bancário/Documental</label>
                    <input id="edit-statusBancodoc" type="text" value={selectedEmployee.statusBancodoc || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, statusBancodoc: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-efetivoRDO"><BriefcaseIcon className="h-3 w-3 text-gray-300" />Efetivo Apontado em RDO</label>
                    <select id="edit-efetivoRDO" value={selectedEmployee.efetivoRDO ? 'sim' : 'nao'} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, efetivoRDO: e.target.value === 'sim' } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 text-sm bg-white dark:bg-slate-800 transition-colors" required>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-centroCusto"><BriefcaseIcon className="h-3 w-3 text-gray-300" />Centro de Custo</label>
                    <input id="edit-centroCusto" type="text" value={selectedEmployee.centroCusto || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, centroCusto: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-obra"><BriefcaseIcon className="h-3 w-3 text-gray-300" />Obra</label>
                    <input id="edit-obra" type="text" value={selectedEmployee.obra || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, obra: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-currentContract"><BriefcaseIcon className="h-3 w-3 text-gray-300" />Contrato</label>
                    <input id="edit-currentContract" type="text" value={selectedEmployee.currentContract || ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, currentContract: e.target.value } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" />
                  </div>
                </div>
              </section>
              {/* Jornada */}
              <section className="pt-0 pb-4">
                <h4 className="text-base font-semibold mb-2 mt-0 text-gray-700 dark:text-slate-200 flex items-center gap-2"><Clock className="h-4 w-4 text-blue-400" />Jornada</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-horasNormaisTrabalhadas"><Clock className="h-3 w-3 text-gray-300" />Horas Normais Trabalhadas</label>
                    <input id="edit-horasNormaisTrabalhadas" type="number" value={selectedEmployee.horasNormaisTrabalhadas ?? ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, horasNormaisTrabalhadas: Number(e.target.value) } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" min={0} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-horasExtrasTrabalhadas"><Clock className="h-3 w-3 text-gray-300" />Horas Extras Trabalhadas</label>
                    <input id="edit-horasExtrasTrabalhadas" type="number" value={selectedEmployee.horasExtrasTrabalhadas ?? ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, horasExtrasTrabalhadas: Number(e.target.value) } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" min={0} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-slate-400 flex items-center gap-1" htmlFor="edit-horasNoturnasTrabalhadas"><Clock className="h-3 w-3 text-gray-300" />Horas Noturnas Trabalhadas</label>
                    <input id="edit-horasNoturnasTrabalhadas" type="number" value={selectedEmployee.horasNoturnasTrabalhadas ?? ''} onChange={e => setSelectedEmployee(prev => prev ? { ...prev, horasNoturnasTrabalhadas: Number(e.target.value) } : prev)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 focus:border-primary rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm bg-white dark:bg-slate-800 transition-colors" min={0} />
                  </div>
                </div>
              </section>
              <div className="flex justify-end mt-8">
                <Button type="submit" variant="primary" className="rounded-lg px-6 py-2 text-base font-medium shadow-none">
                  <Save className="h-4 w-4 mr-2" />Salvar Alterações
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Detalhes do Funcionário</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowViewModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  {selectedEmployee.avatar ? (
                    <img 
                      src={selectedEmployee.avatar} 
                      alt={selectedEmployee.name} 
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <span className="text-white text-lg font-medium">
                      {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{selectedEmployee.name}</h4>
                  <p className="text-gray-600 dark:text-slate-400">{selectedEmployee.currentFunction || 'Função não definida'}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedEmployee.status)}`}>
                    {getStatusLabel(selectedEmployee.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Informações Pessoais</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">CPF:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{selectedEmployee.cpf}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Email:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{selectedEmployee.email || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Telefone:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{selectedEmployee.phone || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Informações Profissionais</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Contrato:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{selectedEmployee.currentContract || 'Não atribuído'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Admissão:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{formatDate(selectedEmployee.admissionDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Matrícula:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{selectedEmployee.id.padStart(6, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowViewModal(false)}>
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Mostrando {filteredEmployees.length} de {employees.length} funcionários
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Próximo
          </Button>
        </div>
      </div>

      {showHistoryModal && historyEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-slate-700"
            aria-modal="true"
            role="dialog"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{t('history.title', { default: 'Histórico de Contratações' })}</h3>
              <Button variant="ghost" size="sm" onClick={closeHistoryModal} aria-label={t('form.close')}>
                <X className="h-4 w-4" />
              </Button>
    </div>
            <div className="space-y-4">
              {historyEmployee.employmentHistory && historyEmployee.employmentHistory.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                  {historyEmployee.employmentHistory.map((entry, idx) => (
                    <li key={idx} className="py-3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <span className="block text-sm font-medium text-gray-700 dark:text-slate-200">{t('form.contract', { default: 'Contrato' })}: <span className="font-semibold">{entry.contractName}</span></span>
                          <span className="block text-sm text-gray-600 dark:text-slate-400">{t('form.data_entrada', { default: 'Admissão' })}: {formatDate(entry.admissionDate)}</span>
                          <span className="block text-sm text-gray-600 dark:text-slate-400">{t('form.data_demissao', { default: 'Demissão' })}: {entry.dismissalDate ? formatDate(entry.dismissalDate) : t('history.active', { default: 'Ativo' })}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 dark:text-slate-400 text-center py-8">{t('history.empty', { default: 'Nenhum histórico encontrado.' })}</div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={closeHistoryModal}>{t('form.close', { default: 'Fechar' })}</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Importação em Massa</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowImportModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="secondary" size="sm" className="mb-2" onClick={() => {
              const headers = [
                'name','registration','company','cpf','phone','birthDate','gender','maritalStatus','pis','ctps','ctpsSeries','ctpsUf','motherName','role','category','currentContractId','admissionDate','status'
              ];
              const example = [
                'João da Silva','A123','Empresa X','12345678901','(11) 91234-5678','1990-01-01','M','Solteiro','12345678900','123456','001','SP','Maria da Silva','Pedreiro','A','c1','2024-01-01','active'
              ];
              const csv = headers.join(',') + '\n' + example.join(',');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'modelo_importacao_funcionarios.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}>
              Baixar Modelo CSV
            </Button>
            <input type="file" accept=".csv,.txt,.json" onChange={handleImportFile} className="mb-4" />
            {importedEmployees.length > 0 && (
              <div className="mb-4 max-h-48 overflow-y-auto border rounded-lg p-2 bg-slate-50 dark:bg-slate-900">
                <div className="mb-2 text-sm text-gray-700 dark:text-slate-200 font-medium">
                  {importedEmployees.length} registro{importedEmployees.length > 1 ? 's' : ''} pronto{importedEmployees.length > 1 ? 's' : ''} para importar.
                </div>
                <table className="w-full text-xs">
                  <thead><tr>{Object.keys(importedEmployees[0]).map(key => <th key={key} className="px-2 py-1 text-left">{key}</th>)}</tr></thead>
                  <tbody>{importedEmployees.map((emp, i) => <tr key={i}>{Object.values(emp).map((v, j) => <td key={j} className="px-2 py-1">{String(v)}</td>)}</tr>)}</tbody>
                </table>
              </div>
            )}
            {importLoading && (
              <div className="w-full flex flex-col items-center mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${(importProgress / importedEmployees.length) * 100}%` }}></div>
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-200">
                  Importando... ({importProgress} de {importedEmployees.length})
                </span>
              </div>
            )}
            <Button onClick={handleImportSubmit} disabled={importLoading || importedEmployees.length === 0} className="w-full mb-2">
              {importLoading ? 'Importando...' : 'Importar Funcionários'}
            </Button>
            {importResults.length > 0 && (
              <div className="mt-4 max-h-32 overflow-y-auto">
                <h4 className="font-semibold mb-2">Relatório de Importação:</h4>
                <div className="mb-2 text-sm text-gray-700 dark:text-slate-200 font-medium">
                  {importResults.filter(r => r.status === 'success').length} sucesso, {importResults.filter(r => r.status !== 'success').length} erro(s)
                </div>
                <ul className="text-xs space-y-1">
                  {importResults.map((r, i) => (
                    <li key={i} className={r.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                      {r.status === 'success' ? `Linha ${r.index + 1}: Sucesso (ID: ${r.id})` : `Linha ${r.index + 1}: Erro - ${Object.values(r.errors).join(', ')}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {importLoading && (
              <Button variant="outline" size="sm" className="mb-2" onClick={() => setImportCancelled(true)}>
                Cancelar Importação
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  )
}