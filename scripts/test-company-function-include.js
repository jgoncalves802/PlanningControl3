async function testCompanyFunctionInclude() {
  console.log('🔍 Testando include de companyFunction...');

  try {
    // Buscar funcionários com include
    const response = await fetch('http://localhost:3000/api/employees?limit=3');
    const data = await response.json();
    
    if (data.employees && data.employees.length > 0) {
      console.log('\n📋 DADOS COM INCLUDE:');
      
      data.employees.forEach((emp, index) => {
        console.log(`\n${index + 1}. ${emp.name}:`);
        console.log('  - companyFunctionId:', emp.companyFunctionId);
        console.log('  - companyFunction:', emp.companyFunction);
        console.log('  - currentFunctionId:', emp.currentFunctionId);
        console.log('  - currentFunction:', emp.currentFunction);
        
        // Testar a lógica da tabela
        let cargoDisplay = '-';
        
        if (emp.companyFunctionId && emp.companyFunction?.name) {
          cargoDisplay = emp.companyFunction.name;
        } else if (emp.currentFunction) {
          if (typeof emp.currentFunction === 'object' && emp.currentFunction?.name) {
            cargoDisplay = emp.currentFunction.name;
          } else if (typeof emp.currentFunction === 'string') {
            cargoDisplay = emp.currentFunction;
          }
        }
        
        console.log('  - Cargo calculado:', cargoDisplay);
      });
      
      // Verificar BRUNO especificamente
      const bruno = data.employees.find(emp => emp.name === 'BRUNO SERGIO SANTOS LOBO');
      if (bruno) {
        console.log('\n🎯 BRUNO ESPECÍFICO:');
        console.log('companyFunctionId:', bruno.companyFunctionId);
        console.log('companyFunction:', bruno.companyFunction);
        
        let cargoDisplay = '-';
        if (bruno.companyFunctionId && bruno.companyFunction?.name) {
          cargoDisplay = bruno.companyFunction.name;
        }
        
        console.log('Cargo final do BRUNO:', cargoDisplay);
        
        if (cargoDisplay === 'ASSISTENTE ADMINISTRATIVO') {
          console.log('✅ BRUNO tem cargo correto!');
        } else {
          console.log('❌ BRUNO não tem cargo correto');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
  }
}

testCompanyFunctionInclude(); 