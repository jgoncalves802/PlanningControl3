// Dados de teste com empresa vazia para testar a correção
const testEmployeesWithEmptyCompany = [
  {
    name: "CARLOS DALBERTO DE OLIVEIRA",
    registration: "12345",
    company: "", // Empresa vazia - deve ser preenchida automaticamente
    cpf: "12345678901",
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
    name: "MARIA SANTOS COSTA",
    registration: "12346",
    company: "   ", // Empresa com espaços em branco - deve ser preenchida automaticamente
    cpf: "98765432100",
    phone: "31987654322",
    birthDate: "20/08/1990",
    gender: "Feminino",
    maritalStatus: "Casada",
    role: "Auxiliar",
    category: "CLT",
    admissionDate: "15/03/2024",
    status: "Ativo"
  },
  {
    name: "JOÃO SILVA SANTOS",
    registration: "12347",
    company: "SARTORI SERVIÇOS", // Empresa já preenchida - deve permanecer
    cpf: "11122233344",
    phone: "31987654323",
    birthDate: "10/12/1988",
    gender: "Masculino",
    maritalStatus: "Casado",
    role: "Técnico",
    category: "CLT",
    admissionDate: "20/03/2024",
    status: "Ativo"
  }
];

// Simular a função getDefaultCompany
function getDefaultCompany() {
  return 'SARTORI SERVIÇOS';
}

// Simular a função de validação
function validateEmployeeFromCSV(data, index) {
  const errors = {};
  
  // Validações obrigatórias
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Nome é obrigatório';
  }
  
  if (!data.registration || data.registration.trim() === '') {
    errors.registration = 'Matrícula é obrigatória';
  }
  
  // Se company estiver vazio, usar empresa padrão
  if (!data.company || data.company.trim() === '') {
    data.company = getDefaultCompany();
    console.log(`Funcionário ${index + 1}: Empresa definida automaticamente como "${data.company}"`);
  }
  
  if (!data.cpf || data.cpf.trim() === '') {
    errors.cpf = 'CPF é obrigatório';
  }
  
  return errors;
}

console.log('🧪 Testando correção automática da empresa...\n');

testEmployeesWithEmptyCompany.forEach((employee, index) => {
  console.log(`📋 Funcionário ${index + 1}: ${employee.name}`);
  console.log('Empresa original:', `"${employee.company}"`);
  
  // Simular validação
  const errors = validateEmployeeFromCSV(employee, index);
  
  console.log('Empresa após validação:', `"${employee.company}"`);
  console.log('Erros:', Object.keys(errors).length > 0 ? errors : 'Nenhum erro');
  console.log('');
});

console.log('✅ Teste concluído!');
console.log('A empresa deve ser preenchida automaticamente quando estiver vazia.'); 