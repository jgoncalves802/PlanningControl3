async function testSSESimple() {
  console.log('🧪 Teste SSE Simples...');

  try {
    // 1. Fazer uma atualização simples
    console.log('1. Buscando BRUNO...');
    const searchResponse = await fetch('http://localhost:3000/api/employees?search=BRUNO SERGIO SANTOS LOBO');
    const searchData = await searchResponse.json();
    
    if (searchData.employees && searchData.employees.length > 0) {
      const bruno = searchData.employees.find(emp => emp.name === 'BRUNO SERGIO SANTOS LOBO');
      
      if (bruno) {
        console.log('✅ BRUNO encontrado:', bruno.id);
        console.log('Notes atual:', bruno.notes || '-');
        
        // 2. Atualizar BRUNO
        console.log('\n2. Atualizando BRUNO...');
        const updateResponse = await fetch(`http://localhost:3000/api/employees/${bruno.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            notes: 'Teste SSE simples - ' + new Date().toLocaleTimeString()
          })
        });
        
        if (updateResponse.ok) {
          console.log('✅ BRUNO atualizado com sucesso');
          
          console.log('\n📋 AGORA TESTE NO NAVEGADOR:');
          console.log('1. Abra http://localhost:3000/dashboard/employees');
          console.log('2. Abra o DevTools (F12) e vá na aba Console');
          console.log('3. Procure por mensagens começando com "[SSE]" ou "[Employees SSE]"');
          console.log('4. Edite qualquer funcionário na interface');
          console.log('5. Veja se aparece uma mensagem SSE no console');
          console.log('6. Veja se a tabela atualiza automaticamente');
          
          console.log('\n🔍 LOGS PARA PROCURAR NO CONSOLE:');
          console.log('✅ "[SSE] Connection opened successfully"');
          console.log('✅ "[Employees SSE] Received event: ..."');
          console.log('✅ "[Employees SSE] Processing event: updated"');
          console.log('✅ "Toast: Dados atualizados automaticamente!"');
          
          console.log('\n❌ PROBLEMAS POSSÍVEIS:');
          console.log('- Se não vê "[SSE] Connection opened": SSE não está conectando');
          console.log('- Se vê conexão mas não eventos: API não está emitindo');
          console.log('- Se vê eventos mas tabela não atualiza: React Query não está refetchando');
          
        } else {
          console.log('❌ Erro ao atualizar BRUNO:', updateResponse.status);
        }
      } else {
        console.log('❌ BRUNO não encontrado');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testSSESimple(); 