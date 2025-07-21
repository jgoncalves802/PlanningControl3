async function debugBrunoCargo() {
  console.log('🔍 Debugando cargo do BRUNO SERGIO SANTOS LOBO...');

  try {
    // Buscar BRUNO na API
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
        
        console.log('\n📊 CARGO EXIBIDO:');
        const cargoDisplay = bruno.companyFunction?.name || 
                           (typeof bruno.currentFunction === 'object' ? bruno.currentFunction?.name : bruno.currentFunction) ||
                           '-';
        console.log('Cargo na tabela:', cargoDisplay);
        
        console.log('\n🔍 VERIFICAÇÃO:');
        if (bruno.companyFunctionId && !bruno.companyFunction?.name) {
          console.log('❌ PROBLEMA: companyFunctionId existe mas companyFunction.name está vazio');
        } else if (bruno.companyFunction?.name) {
          console.log('✅ companyFunction.name existe:', bruno.companyFunction.name);
        } else {
          console.log('❌ Nenhuma função encontrada');
        }
        
      } else {
        console.log('❌ BRUNO não encontrado na lista');
      }
    } else {
      console.log('❌ Nenhum funcionário encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar BRUNO:', error.message);
  }
}

debugBrunoCargo(); 