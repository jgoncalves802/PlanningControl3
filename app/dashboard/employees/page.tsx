'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Download,
  Shield,
  Settings,
  Trash2,
  X,
  UserPlus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Employee } from '@/lib/mock-data'
import { 
  getCurrentUser, 
  getUserPermissions, 
  getAccessibleContracts, 
  canUserAccessContract,
  validateUserAccess,
  User,
  UserRole
} from '@/lib/auth'
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getEmployees } from '@/lib/employeeService'
import { useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useAddAdmission, useAddDismissal } from '@/lib/useCreateEmployee'
import { useEmployeesQuery } from '@/lib/useEmployeesQuery'
import { ImportEmployeesDialog } from '@/components/employees/ImportEmployeesDialog'
import EmployeeTable from '@/components/employees/EmployeeTable'
import EmployeeFilters from '@/components/employees/EmployeeFilters'
import EmployeeStats from '@/components/employees/EmployeeStats'
import EmployeeAddModal from '@/components/employees/EmployeeAddModal'
import EmployeeViewModal from '@/components/employees/EmployeeViewModal'
import EmployeeHistoryModal from '@/components/employees/EmployeeHistoryModal'
import { useEmployeeFilters } from '@/lib/hooks/useEmployeeFilters'

// Configuração das colunas disponíveis
interface ColumnConfig {
  key: string
  label: string
  enabled: boolean
  width?: string
}

export default function EmployeesPage() {
  // Estados principais
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [columns, setColumns] = useState<ColumnConfig[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)

  // Estados para export
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Estados para histórico
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState<Employee | null>(null);

  // Queries e mutations
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  const addAdmissionMutation = useAddAdmission();
  const addDismissalMutation = useAddDismissal();
  const { data: employees = [], isLoading: isEmployeesLoading, isError: isEmployeesError, refetch } = useEmployeesQuery();

  // Hook de filtros
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showFilters,
    setShowFilters,
    filterContract,
    setFilterContract,
    filterFunction,
    setFilterFunction,
    filterAdmission,
    setFilterAdmission,
    filterCity,
    setFilterCity,
    filterDismissal,
    setFilterDismissal,
    filteredEmployees,
    clearFilters
  } = useEmployeeFilters(employees);

  // Configuração das colunas da tabela
  const defaultColumns: ColumnConfig[] = [
    { key: 'name', label: 'Nome', enabled: true, width: '230px' },
    { key: 'cpf', label: 'CPF', enabled: true, width: '150px' },
    { key: 'matricula', label: 'Matrícula', enabled: true, width: '90px' },
    { key: 'cargo', label: 'Cargo', enabled: true, width: '150px' },
    { key: 'status', label: 'Status', enabled: true, width: '90px' },
    { key: 'cidade', label: 'Cidade', enabled: true, width: '110px' },
    { key: 'telefone', label: 'Telefone', enabled: false, width: '110px' },
    { key: 'dataEntrada', label: 'Data de Entrada', enabled: true, width: '150px' },
    { key: 'contrato', label: 'Contrato', enabled: true, width: '110px' },
    { key: 'centroCusto', label: 'Centro de Custo', enabled: true, width: '150px' },
    { key: 'turno', label: 'Turno', enabled: false, width: '80px' },
    { key: 'obra', label: 'Obra', enabled: false, width: '100px' },
    { key: 'mo', label: 'Tipo de Mão de Obra', enabled: true, width: '130px' },
    { key: 'dismissalDate', label: 'Data de Demissão', enabled: false, width: '110px' },
  ];

  // Inicializar usuário e permissões
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)
    
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

  // Handlers da tabela
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

  // Handlers de ações
  const fetchCompleteEmployeeData = async (employeeId: string): Promise<Employee | null> => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do funcionário');
      }
      const employeeData = await response.json();
      
      if (employeeData.address && !employeeData.endereco) {
        employeeData.endereco = employeeData.address;
      }
      
      return employeeData;
    } catch (error) {
      console.error('Erro ao buscar funcionário:', error);
      toast.error('Erro ao carregar dados do funcionário');
      return null;
    }
  };

  const handleOpenEditDrawer = async (employee: Employee) => {
    const completeEmployee = await fetchCompleteEmployeeData(employee.id);
    if (completeEmployee) {
      setSelectedEmployee(completeEmployee);
      setShowEditModal(true);
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleShowHistory = (employee: Employee) => {
    setHistoryEmployee(employee);
    setShowHistoryModal(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (!validateUserAccess(currentUser!, 'MANAGE_EMPLOYEES')) return;
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      deleteEmployeeMutation.mutate(
        employeeId,
        {
          onSuccess: () => {
            toast.success('Funcionário excluído com sucesso!');
          },
          onError: () => {
            toast.error('Erro ao excluir funcionário.');
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
      toast.success('Funcionários excluídos com sucesso!');
    }
  };

  // Funções de exportação
  function toCSV(rows: any[], columns: ColumnConfig[]) {
    const header = columns.map(col => col.label).join(',')
    const data = rows.map(row => columns.map(col => {
      let value = row[col.key]
      if (typeof value === 'string') value = '"' + value.replace(/"/g, '""') + '"'
      return value ?? ''
    }).join(','))
    return [header, ...data].join('\n')
  }

  const handleExport = () => {
    const exportColumns = columns.filter(col => col.enabled)
    const exportRows = filteredEmployees
    const csv = toCSV(exportRows, exportColumns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, 'funcionarios.csv')
    toast.success('Exportação concluída!')
  }

  const handleExportXLSX = () => {
    const exportColumns = columns.filter(col => col.enabled)
    const exportRows = filteredEmployees.map(row => {
      const obj: any = {}
      exportColumns.forEach(col => {
        obj[col.label] = row[col.key]
      })
      return obj
    })
    const ws = XLSX.utils.json_to_sheet(exportRows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Funcionários')
    XLSX.writeFile(wb, 'funcionarios.xlsx')
    toast.success('Exportação XLSX concluída!')
  }

  const handleExportPDF = () => {
    const exportColumns = columns.filter(col => col.enabled)
    const doc = new jsPDF({ orientation: 'landscape' })
    const companyName = currentUser?.name || 'Empresa'
    
    doc.setFontSize(14)
    doc.text(companyName, 14, 14)
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

  if (!currentUser || !userPermissions || isEmployeesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loader mr-2"></span> Carregando funcionários...
      </div>
    );
  }

  if (isEmployeesError) {
    return (
      <div className="flex items-center justify-center h-96 text-red-600">
        <X className="h-5 w-5 mr-2" /> Erro ao carregar funcionários.
        <Button variant="outline" size="sm" className="ml-4" onClick={() => refetch()}>Tentar novamente</Button>
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
            <ImportEmployeesDialog 
              onImportComplete={(result) => {
                if (result.summary.created > 0) {
                  refetch();
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={() => setShowColumnConfig(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Colunas
            </Button>
            <div className="dropdown dropdown-end relative" ref={exportMenuRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu((v) => !v)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="font-semibold">Exportar</span>
              </Button>
              {showExportMenu && (
                <ul className="absolute left-0 mt-2 menu p-2 space-y-1 shadow-xl bg-white dark:bg-slate-800 rounded-xl w-52 z-[9999] border border-gray-200 dark:border-slate-700 animate-fade-in">
                  <li>
                    <button onClick={() => { handleExport(); setShowExportMenu(false) }} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30">
                      Exportar CSV
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { handleExportXLSX(); setShowExportMenu(false) }} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/30">
                      Exportar XLSX
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { handleExportPDF(); setShowExportMenu(false) }} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30">
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
        <EmployeeStats employees={employees} />

        {/* Filters and Search */}
        <EmployeeFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterContract={filterContract}
          setFilterContract={setFilterContract}
          filterFunction={filterFunction}
          setFilterFunction={setFilterFunction}
          filterAdmission={filterAdmission}
          setFilterAdmission={setFilterAdmission}
          filterCity={filterCity}
          setFilterCity={setFilterCity}
          filterDismissal={filterDismissal}
          setFilterDismissal={setFilterDismissal}
          onClearFilters={clearFilters}
        />

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
              <EmployeeTable
                employees={filteredEmployees}
                columns={columns}
                selectedEmployees={selectedEmployees}
                canManageEmployees={validateUserAccess(currentUser, 'MANAGE_EMPLOYEES')}
                onSelectEmployee={handleSelectEmployee}
                onSelectAll={handleSelectAll}
                onViewEmployee={handleViewEmployee}
                onEditEmployee={handleOpenEditDrawer}
                onShowHistory={handleShowHistory}
              />
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
        <EmployeeAddModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={(employeeData) => {
            createEmployeeMutation.mutate(employeeData, {
              onSuccess: () => {
                toast.success('Funcionário adicionado com sucesso!');
                setShowAddModal(false);
                refetch();
              },
              onError: (error) => {
                console.error('Erro ao adicionar funcionário:', error);
                toast.error('Erro ao adicionar funcionário');
              }
            });
          }}
          isLoading={createEmployeeMutation.isPending}
        />

        {/* View Employee Modal */}
        <EmployeeViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          employee={selectedEmployee}
        />

        {/* History Modal */}
        <EmployeeHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          employee={historyEmployee}
        />

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
      </div>
    </>
  )
} 