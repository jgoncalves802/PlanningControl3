// Utilitário para testar a importação em massa de funcionários
// Baseado nos dados do arquivo modelo_importacao_funcionarios2.csv

export const sampleEmployeesData = [
  {
    name: "ADRIANA GOMES DOS SANTOS",
    registration: "30857",
    company: "SARTORI SERVIÇOS",
    cpf: "33900346417", // CPF válido de exemplo
    phone: "31983405208",
    birthDate: "15/05/1985",
    gender: "Feminino",
    maritalStatus: "Solteira",
    pis: "",
    ctps: "",
    ctpsSeries: "",
    ctpsUf: "",
    motherName: "MARIA GOMES DOS SANTOS",
    role: "Operadora",
    category: "CLT",
    currentContractId: "",
    admissionDate: "25/03/2025",
    status: "Ativo"
  },
  {
    name: "EDCARLOS PEREIRA DA SILVA",
    registration: "29438",
    company: "SARTORI SERVIÇOS",
    cpf: "54359036452", // CPF válido de exemplo
    phone: "33999100232",
    birthDate: "20/08/1980",
    gender: "Masculino",
    maritalStatus: "Casado",
    pis: "",
    ctps: "",
    ctpsSeries: "",
    ctpsUf: "",
    motherName: "MARIA PEREIRA DA SILVA",
    role: "Operador",
    category: "CLT",
    currentContractId: "",
    admissionDate: "02/07/2024",
    status: "Ativo"
  },
  {
    name: "ALAIR MONTEIRO DUARTE",
    registration: "29421",
    company: "SARTORI SERVIÇOS",
    cpf: "93070284604",
    phone: "31984707840",
    birthDate: "10/12/1975",
    gender: "Masculino",
    maritalStatus: "Solteiro",
    pis: "",
    ctps: "",
    ctpsSeries: "",
    ctpsUf: "",
    motherName: "ANTONIA MONTEIRO DUARTE",
    role: "Técnico",
    category: "CLT",
    currentContractId: "",
    admissionDate: "19/01/2023",
    status: "Ativo"
  }
];

// Dados com erros para testar validação
export const sampleEmployeesWithErrors = [
  {
    name: "FUNCIONARIO TESTE 1",
    registration: "TEST001",
    company: "SARTORI SERVIÇOS",
    cpf: "12345678901", // CPF válido
    phone: "31987654321",
    birthDate: "15/05/1985",
    gender: "Masculino",
    maritalStatus: "Solteiro",
    role: "Operador",
    category: "CLT",
    admissionDate: "01/03/2024",
    status: "Ativo"
  },
  {
    name: "", // Nome vazio - erro
    registration: "TEST002",
    company: "SARTORI SERVIÇOS",
    cpf: "11111111111", // CPF inválido - todos iguais
    phone: "319876543", // Telefone inválido - poucos dígitos
    birthDate: "32/13/2024", // Data inválida
    gender: "Masculino",
    maritalStatus: "Solteiro",
    role: "Operador",
    category: "CLT",
    admissionDate: "01/03/2024",
    status: "Ativo"
  },
  {
    name: "FUNCIONARIO TESTE 3",
    registration: "", // Matrícula vazia - erro
    company: "", // Empresa vazia - erro
    cpf: "12345", // CPF inválido - poucos dígitos
    phone: "31987654323",
    birthDate: "15/05/1985",
    gender: "Feminino",
    maritalStatus: "Casada",
    role: "Auxiliar",
    category: "CLT",
    admissionDate: "01/03/2024",
    status: "Ativo"
  }
];

// Função para testar a importação
export async function testEmployeeImport(data: any[] = sampleEmployeesData) {
  try {
    const response = await fetch('/api/employees/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    





    
    if (result.failedEmployees && result.failedEmployees.length > 0) {

      result.failedEmployees.forEach((emp: any) => {

        Object.entries(emp.errors).forEach(([field, error]) => {

        });
      });
    }
    
    if (result.createdEmployees && result.createdEmployees.length > 0) {

      result.createdEmployees.forEach((emp: any) => {

      });
    }
    
    return result;
    
  } catch (error) {
    console.error('Erro ao testar importação:', error);
    throw error;
  }
}

// Função para converter dados do CSV real para formato da API
export function convertCSVRowToAPIFormat(csvRow: any) {
  return {
    name: csvRow.name?.trim(),
    registration: csvRow.registration?.toString().trim(),
    company: csvRow.company?.trim(),
    cpf: csvRow.cpf?.toString().replace(/\D/g, ''),
    phone: csvRow.phone?.toString().replace(/\D/g, ''),
    birthDate: csvRow.birthDate?.trim(),
    gender: csvRow.gender?.trim(),
    maritalStatus: csvRow.maritalStatus?.trim(),
    pis: csvRow.pis?.toString().replace(/\D/g, ''),
    ctps: csvRow.ctps?.toString().replace(/\D/g, ''),
    ctpsSeries: csvRow.ctpsSeries?.toString().trim(),
    ctpsUf: csvRow.ctpsUf?.toString().trim().toUpperCase(),
    motherName: csvRow.motherName?.trim(),
    
    currentContractId: csvRow.currentContractId?.toString().trim(),
    admissionDate: csvRow.admissionDate?.trim(),
    status: csvRow.status?.trim() || 'Ativo'
  };
}

// Função para validar dados antes de enviar
export function validateDataBeforeImport(data: any[]) {
  const issues: string[] = [];
  
  data.forEach((item, index) => {
    if (!item.name?.trim()) {
      issues.push(`Linha ${index + 1}: Nome é obrigatório`);
    }
    
    if (!item.registration?.toString().trim()) {
      issues.push(`Linha ${index + 1}: Matrícula é obrigatória`);
    }
    
    if (!item.company?.trim()) {
      issues.push(`Linha ${index + 1}: Empresa é obrigatória`);
    }
    
    if (!item.cpf?.toString().trim()) {
      issues.push(`Linha ${index + 1}: CPF é obrigatório`);
    }
  });
  
  return issues;
}

// Exemplo de uso:
// import { testEmployeeImport, sampleEmployeesData, sampleEmployeesWithErrors } from '@/lib/test-import';
// 
// // Testar com dados válidos
// await testEmployeeImport(sampleEmployeesData);
// 
// // Testar com dados com erros
// await testEmployeeImport(sampleEmployeesWithErrors); 
