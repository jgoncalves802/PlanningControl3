// Teste para verificar se a atribuição de funções está funcionando
const testFunctionAssignment = async () => {
  console.log('🔍 Testando atribuição de funções...');
  
  try {
    // 1. Buscar funcionários para verificar se a relação companyFunction está sendo carregada
    console.log('\n1. Buscando funcionários...');
    const employeesResponse = await fetch('http://localhost:3001/api/employees?limit=5');
    const employeesData = await employeesResponse.json();
    
    if (employeesData.employees && employeesData.employees.length > 0) {
      console.log('✅ Funcionários carregados:', employeesData.employees.length);
      
      // Verificar se a relação companyFunction está sendo carregada
      const firstEmployee = employeesData.employees[0];
      console.log('📋 Primeiro funcionário:', {
        id: firstEmployee.id,
        name: firstEmployee.name,
        companyFunctionId: firstEmployee.companyFunctionId,
        companyFunction: firstEmployee.companyFunction
      });
      
      if (firstEmployee.companyFunction) {
        console.log('✅ Relação companyFunction carregada corretamente');
      } else {
        console.log('⚠️ Relação companyFunction não está sendo carregada');
      }
    } else {
      console.log('❌ Nenhum funcionário encontrado');
      return;
    }
    
    // 2. Buscar funções disponíveis
    console.log('\n2. Buscando funções disponíveis...');
    const functionsResponse = await fetch('http://localhost:3001/api/functions');
    const functionsData = await functionsResponse.json();
    
    if (functionsData.functions && functionsData.functions.length > 0) {
      console.log('✅ Funções disponíveis:', functionsData.functions.length);
      console.log('📋 Primeira função:', {
        id: functionsData.functions[0].id,
        name: functionsData.functions[0].name,
        laborType: functionsData.functions[0].laborType
      });
    } else {
      console.log('❌ Nenhuma função encontrada');
      return;
    }
    
    // 3. Testar atualização de funcionário com função
    console.log('\n3. Testando atualização de funcionário com função...');
    const employeeToUpdate = employeesData.employees[0];
    const functionToAssign = functionsData.functions[0];
    
    const updateData = {
      companyFunctionId: functionToAssign.id,
      role: functionToAssign.name,
      mo: functionToAssign.laborType
    };
    
    console.log('📤 Dados para atualização:', updateData);
    
    const updateResponse = await fetch(`http://localhost:3001/api/employees/${employeeToUpdate.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    if (updateResponse.ok) {
      const updatedEmployee = await updateResponse.json();
      console.log('✅ Funcionário atualizado com sucesso');
      console.log('📋 Dados atualizados:', {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        companyFunctionId: updatedEmployee.companyFunctionId,
        role: updatedEmployee.role,
        mo: updatedEmployee.mo
      });
    } else {
      const error = await updateResponse.json();
      console.log('❌ Erro ao atualizar funcionário:', error);
    }
    
    // 4. Verificar se a função foi atribuída corretamente
    console.log('\n4. Verificando atribuição...');
    const checkResponse = await fetch(`http://localhost:3001/api/employees/${employeeToUpdate.id}`);
    const checkData = await checkResponse.json();
    
    console.log('📋 Funcionário após atualização:', {
      id: checkData.id,
      name: checkData.name,
      companyFunctionId: checkData.companyFunctionId,
      companyFunction: checkData.companyFunction,
      role: checkData.role,
      mo: checkData.mo
    });
    
    if (checkData.companyFunctionId === functionToAssign.id) {
      console.log('✅ Função atribuída corretamente!');
    } else {
      console.log('❌ Função não foi atribuída corretamente');
    }
    
    if (checkData.companyFunction && checkData.companyFunction.id === functionToAssign.id) {
      console.log('✅ Relação companyFunction carregada corretamente!');
    } else {
      console.log('❌ Relação companyFunction não está sendo carregada');
    }
    
    console.log('\n🎉 Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
};

// Executar o teste
testFunctionAssignment(); 