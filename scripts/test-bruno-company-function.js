async function testBrunoCompanyFunction() {
  console.log('🔍 Testando BRUNO e sua companyFunction...');

  try {
    // Buscar BRUNO especificamente
    const response = await fetch('http://localhost:3000/api/employees?search=BRUNO SERGIO SANTOS LOBO');
    const data = await response.json();
    
    if (data.employees && data.employees.length > 0) {
      const bruno = data.employees.find(emp => emp.name === 'BRUNO SERGIO SANTOS LOBO');
      
      if (bruno) {
        console.log('\n📋 DADOS DO BRUNO:');
        console.log('ID:', bruno.id);
        console.log('Nome:', bruno.name);
        console.log('CPF:', bruno.cpf);
        console.log('Status:', bruno.isActive ? 'Ativo' : 'Inativo');
        
        console.log('\n🏢 FUNÇÕES:');
        console.log('companyFunctionId:', bruno.companyFunctionId);
        console.log('companyFunction:', bruno.companyFunction);
        console.log('currentFunctionId:', bruno.currentFunctionId);
        console.log('currentFunction:', bruno.currentFunction);
        
        console.log('\n📊 CARGO CALCULADO:');
        let cargoDisplay = '-';
        
        if (bruno.companyFunctionId && bruno.companyFunction?.name) {
          cargoDisplay = bruno.companyFunction.name;
          console.log('✅ Usando companyFunction.name:', cargoDisplay);
        } else if (bruno.currentFunction) {
          if (typeof bruno.currentFunction === 'object' && bruno.currentFunction?.name) {
            cargoDisplay = bruno.currentFunction.name;
            console.log('✅ Usando currentFunction.name:', cargoDisplay);
          } else if (typeof bruno.currentFunction === 'string') {
            cargoDisplay = bruno.currentFunction;
            console.log('✅ Usando currentFunction (string):', cargoDisplay);
          }
        } else {
          console.log('❌ Nenhuma função encontrada');
        }
        
        console.log('\n🎯 RESULTADO FINAL:');
        console.log('Cargo na tabela:', cargoDisplay);
        
        if (cargoDisplay === 'ASSISTENTE ADMINISTRATIVO') {
          console.log('✅ BRUNO tem cargo correto!');
        } else {
          console.log('❌ BRUNO não tem cargo correto');
          console.log('Esperado: ASSISTENTE ADMINISTRATIVO');
          console.log('Encontrado:', cargoDisplay);
        }
      } else {
        console.log('❌ BRUNO não encontrado');
      }
    } else {
      console.log('❌ Nenhum funcionário encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
  }
}

testBrunoCompanyFunction(); 