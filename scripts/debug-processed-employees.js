async function debugProcessedEmployees() {
  console.log('🔍 Debugando dados processados dos funcionários...');

  try {
    // Buscar dados da API
    const response = await fetch('http://localhost:3000/dashboard/employees');
    console.log('✅ Página carregando:', response.status === 200 ? 'SIM' : 'NÃO');
    
    // Buscar dados da API diretamente
    const apiResponse = await fetch('http://localhost:3000/api/employees?limit=5');
    const data = await apiResponse.json();
    
    if (data.employees && data.employees.length > 0) {
      console.log('\n📋 DADOS DA API (primeiros 5 funcionários):');
      
      data.employees.forEach((emp, index) => {
        console.log(`\n${index + 1}. ${emp.name}:`);
        console.log('  - companyFunctionId:', emp.companyFunctionId);
        console.log('  - companyFunction:', emp.companyFunction);
        console.log('  - currentFunctionId:', emp.currentFunctionId);
        console.log('  - currentFunction:', emp.currentFunction);
        
        // Simular o processamento da página
        const processedEmp = {
          ...emp,
          status: emp.isActive ? 'active' : 'inactive'
        };
        
        console.log('  - Processado status:', processedEmp.status);
        console.log('  - Processado companyFunction:', processedEmp.companyFunction);
        console.log('  - Processado currentFunction:', processedEmp.currentFunction);
        
        // Simular a lógica da tabela
        const cargoDisplay = processedEmp.companyFunction?.name || 
                           (typeof processedEmp.currentFunction === 'object' ? processedEmp.currentFunction?.name : processedEmp.currentFunction) ||
                           '-';
        console.log('  - Cargo na tabela:', cargoDisplay);
      });
      
      // Verificar BRUNO especificamente
      const bruno = data.employees.find(emp => emp.name === 'BRUNO SERGIO SANTOS LOBO');
      if (bruno) {
        console.log('\n🎯 BRUNO ESPECÍFICO:');
        console.log('companyFunction:', bruno.companyFunction);
        console.log('currentFunction:', bruno.currentFunction);
        
        const processedBruno = {
          ...bruno,
          status: bruno.isActive ? 'active' : 'inactive'
        };
        
        const cargoDisplay = processedBruno.companyFunction?.name || 
                           (typeof processedBruno.currentFunction === 'object' ? processedBruno.currentFunction?.name : processedBruno.currentFunction) ||
                           '-';
        console.log('Cargo final do BRUNO:', cargoDisplay);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao debugar:', error.message);
  }
}

debugProcessedEmployees(); 