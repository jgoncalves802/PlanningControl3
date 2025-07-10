'use client'

import { useState, useEffect } from 'react';
import { useContractsQuery } from '@/lib/hooks/useContracts';
import { useEmployeesQuery } from '@/lib/useEmployeesQuery';
import { useUpdateEmployee } from '@/lib/useCreateEmployee';
import EmployeeTable from '@/components/employees/EmployeeTable';
import EmployeeFilters from '@/components/employees/EmployeeFilters';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function EmployeeAssignmentPage() {
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  // Estados para contratos (implementação manual como backup)
  const [manualContracts, setManualContracts] = useState([]);
  const [manualLoading, setManualLoading] = useState(true);
  const [manualError, setManualError] = useState(null);

  // Buscar contratos usando React Query
  const { data: contractsData, isLoading: contractsLoading, error: contractsError, refetch } = useContractsQuery({ 
    limit: 100,
    page: 1
  });

  // Fetch manual como backup
  useEffect(() => {
    const fetchContractsManually = async () => {
      try {
        setManualLoading(true);
        setManualError(null);
        
        const response = await fetch('/api/contracts?limit=100');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Manual fetch result:', data);
        setManualContracts(data.contracts || []);
      } catch (error) {
        console.error('Manual fetch error:', error);
        setManualError(error.message);
      } finally {
        setManualLoading(false);
      }
    };

    fetchContractsManually();
  }, []);

  // Debug: log dos dados recebidos
  useEffect(() => {
    console.log('=== CONTRACTS DEBUG ===');
    console.log('React Query - Loading:', contractsLoading);
    console.log('React Query - Error:', contractsError);
    console.log('React Query - Data:', contractsData);
    console.log('Manual - Loading:', manualLoading);
    console.log('Manual - Error:', manualError);
    console.log('Manual - Contracts:', manualContracts);
  }, [contractsLoading, contractsError, contractsData, manualLoading, manualError, manualContracts]);

  // Usar dados manuais como fallback
  const finalContractsData = contractsData || { contracts: manualContracts };
  const finalLoading = contractsLoading && manualLoading;
  const finalError = contractsError || manualError;

  // Filtros controlados
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterContract, setFilterContract] = useState('');
  const [filterFunction, setFilterFunction] = useState('');
  const [filterAdmission, setFilterAdmission] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterDismissal, setFilterDismissal] = useState('');

  // Seleção múltipla
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  // Buscar funcionários
  const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useEmployeesQuery({
    search: searchTerm,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });

  // Mapear para formato esperado pela tabela
  const employees = (employeesData?.employees || []).map(emp => ({
    ...emp,
    status: emp.isActive ? 'active' : 'dismissed',
    contractAssignmentDate: emp['contractAssignmentDate'] || '',
    contractId: emp['contractId'] || null,
  }));

  // Colunas padrão
  const columns = [
    { key: 'name', label: 'Nome', enabled: true },
    { key: 'cpf', label: 'CPF', enabled: true },
    { key: 'matricula', label: 'Matrícula', enabled: true },
    { key: 'cargo', label: 'Cargo', enabled: true },
    { key: 'status', label: 'Status', enabled: true },
    { key: 'contrato', label: 'Contrato', enabled: true },
    { key: 'contractAssignmentDate', label: 'Data de Vinculação', enabled: true },
  ];

  // Filtrar funcionários disponíveis (não vinculados ao contrato selecionado)
  const availableEmployees = employees.filter(emp => emp.contractId !== selectedContractId);
  const linkedEmployees = employees.filter(emp => emp.contractId === selectedContractId);

  // Handlers para seleção
  const handleSelectEmployee = (id: string) => {
    setSelectedEmployeeIds(prev => prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]);
  };
  const handleSelectAll = () => {
    if (selectedEmployeeIds.length === availableEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(availableEmployees.map(emp => emp.id));
    }
  };

  // Handler para solicitação de transferência
  const handleTransferRequest = (employeeId: string) => {
    toast.success('Funcionalidade de transferência será implementada em breve');
  };

  // Handlers de visualização/edição/histórico (placeholders)
  const handleViewEmployee = () => {};
  const handleEditEmployee = () => {};
  const handleShowHistory = () => {};

  // Limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFilterContract('');
    setFilterFunction('');
    setFilterAdmission('');
    setFilterCity('');
    setFilterDismissal('');
  };

  // Mutation para atualizar funcionário
  const updateEmployeeMutation = useUpdateEmployee();
  const [isLinking, setIsLinking] = useState(false);

  // Ação de vincular em lote
  const handleLinkEmployees = async () => {
    if (!selectedContractId || selectedEmployeeIds.length === 0) return;
    setIsLinking(true);
    
    const selectedContract = finalContractsData?.contracts.find(c => c.id === selectedContractId);
    const contractName = selectedContract ? selectedContract.name : 'contrato selecionado';
    
    toast.loading(`Vinculando ${selectedEmployeeIds.length} funcionário(s) ao ${contractName}...`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      await Promise.allSettled(
        selectedEmployeeIds.map(async (id) => {
          try {
            const employee = availableEmployees.find(emp => emp.id === id);
            await updateEmployeeMutation.mutateAsync({
              id,
              updates: {
                contractId: selectedContractId,
                contractAssignmentDate: new Date().toISOString(),
              },
            });
            successCount++;
            if (employee) {
              toast.success(`✓ ${employee.name} vinculado com sucesso`, { duration: 3000 });
            }
          } catch (error) {
            errorCount++;
            const employee = availableEmployees.find(emp => emp.id === id);
            const errorMessage = employee ? `✗ Erro ao vincular ${employee.name}` : `✗ Erro ao vincular funcionário`;
            errors.push(errorMessage);
            toast.error(errorMessage, { duration: 5000 });
          }
        })
      );

      toast.dismiss();
      
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Todos os ${successCount} funcionário(s) foram vinculados com sucesso!`, { duration: 5000 });
      } else if (successCount > 0 && errorCount > 0) {
        toast.success(`${successCount} funcionário(s) vinculados com sucesso`, { duration: 4000 });
        toast.error(`${errorCount} funcionário(s) falharam na vinculação`, { duration: 6000 });
      } else if (errorCount > 0) {
        toast.error(`Falha ao vincular todos os funcionários selecionados`, { duration: 6000 });
      }
      
      setSelectedEmployeeIds([]);
    } catch (err) {
      toast.dismiss();
      toast.error('Erro inesperado durante a vinculação.');
    } finally {
      setIsLinking(false);
    }
  };

  // Mostrar erros se houver
  if (finalError && finalLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold mb-2">Erro ao carregar contratos</h2>
            <p className="text-red-600">
              {finalError || 'Erro desconhecido ao carregar contratos'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (employeesError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold mb-2">Erro ao carregar funcionários</h2>
            <p className="text-red-600">
              {employeesError?.message || 'Erro desconhecido ao carregar funcionários'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vincular Funcionários a Contrato</h1>
          <p className="text-gray-600">
            Selecione um contrato ativo e marque os funcionários que deseja vincular. 
            Funcionários já vinculados ao contrato selecionado não podem ser selecionados novamente.
          </p>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione um contrato</label>
          <select
            className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2"
            value={selectedContractId}
            onChange={e => setSelectedContractId(e.target.value)}
            disabled={finalLoading || isLinking}
          >
            <option value="">
              {finalLoading ? 'Carregando contratos...' : 'Selecione...'}
            </option>
            {finalContractsData?.contracts?.filter(contract => contract.isActive).map(contract => (
              <option key={contract.id} value={contract.id}>
                {contract.name} ({contract.code})
              </option>
            ))}
          </select>
          {/* Status info */}
          {!finalLoading && (
            <div className="mt-2 text-sm text-gray-500">
              {finalContractsData?.contracts?.filter(contract => contract.isActive).length || 0} contratos ativos encontrados
              {finalError && (
                <div className="text-red-600 mt-1">
                  Erro ao carregar contratos: {finalError}{' '}
                  <button 
                    onClick={() => window.location.reload()} 
                    className="underline hover:no-underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Debug visual */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
              <strong>Debug Info:</strong>
              <br />React Query Loading: {contractsLoading ? 'true' : 'false'}
              <br />React Query Error: {contractsError ? contractsError.message : 'none'}
              <br />React Query Data: {contractsData ? 'exists' : 'null'}
              <br />Manual Loading: {manualLoading ? 'true' : 'false'}
              <br />Manual Error: {manualError || 'none'}
              <br />Manual Contracts: {manualContracts.length}
              <br />Final Contracts count: {finalContractsData?.contracts?.length || 0}
              <br />Active Contracts: {finalContractsData?.contracts?.filter(c => c.isActive).length || 0}
              {finalContractsData?.contracts && (
                <div className="mt-2">
                  <strong>Final Contracts Data:</strong>
                  <pre className="mt-1 text-xs overflow-auto max-h-32">
                    {JSON.stringify(finalContractsData.contracts, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Filtros controlados */}
        <div className="mb-4">
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
            onClearFilters={handleClearFilters}
          />
        </div>
        {/* Funcionários já vinculados ao contrato */}
        {selectedContractId && linkedEmployees.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Funcionários já vinculados a este contrato ({linkedEmployees.length})
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2">
                {linkedEmployees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between bg-white rounded px-3 py-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{emp.name}</span>
                      <span className="text-gray-500">({emp.cpf})</span>
                      {emp.contractAssignmentDate && (
                        <span className="text-sm text-blue-600">
                          Vinculado em: {new Date(emp.contractAssignmentDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTransferRequest(emp.id)}
                    >
                      Solicitar Transferência
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Funcionários disponíveis para vinculação */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Funcionários disponíveis para vinculação ({availableEmployees.length})
          </h3>
        </div>

        <EmployeeTable
          employees={availableEmployees}
          columns={columns}
          selectedEmployees={selectedEmployeeIds}
          canManageEmployees={true}
          onSelectEmployee={handleSelectEmployee}
          onSelectAll={handleSelectAll}
          onViewEmployee={handleViewEmployee}
          onEditEmployee={handleEditEmployee}
          onShowHistory={handleShowHistory}
        />
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedEmployeeIds.length > 0 ? (
              `${selectedEmployeeIds.length} funcionário(s) selecionado(s)`
            ) : (
              'Nenhum funcionário selecionado'
            )}
          </div>
          <Button
            disabled={!selectedContractId || selectedEmployeeIds.length === 0 || isLinking}
            onClick={handleLinkEmployees}
            loading={isLinking}
            className="min-w-[200px]"
          >
            {isLinking ? 'Vinculando...' : `Vincular ${selectedEmployeeIds.length} funcionário(s)`}
          </Button>
        </div>
      </div>
    </div>
  );
} 