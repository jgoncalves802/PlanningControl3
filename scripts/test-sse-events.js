const { EventSource } = require('events');

async function testSSEEvents() {
  console.log('🧪 Testando se SSE está emitindo eventos...');

  try {
    // 1. Conectar ao SSE
    console.log('1. Conectando ao SSE...');
    const eventSource = new EventSource('http://localhost:3000/api/employees/events');
    
    let eventReceived = false;
    
    eventSource.onopen = () => {
      console.log('✅ SSE conectado com sucesso');
    };
    
    eventSource.onmessage = (event) => {
      console.log('📨 Evento SSE recebido:', event.data);
      eventReceived = true;
    };
    
    eventSource.addEventListener('employee-update', (event) => {
      console.log('👤 Evento employee-update recebido:', event.data);
      eventReceived = true;
    });
    
    eventSource.onerror = (error) => {
      console.error('❌ Erro no SSE:', error);
    };
    
    // 2. Aguardar conexão
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Buscar BRUNO
    console.log('\n2. Buscando BRUNO...');
    const searchResponse = await fetch('http://localhost:3000/api/employees?search=BRUNO SERGIO SANTOS LOBO');
    const searchData = await searchResponse.json();
    
    if (searchData.employees && searchData.employees.length > 0) {
      const bruno = searchData.employees.find(emp => emp.name === 'BRUNO SERGIO SANTOS LOBO');
      
      if (bruno) {
        console.log('✅ BRUNO encontrado:', bruno.id);
        
        // 4. Atualizar BRUNO
        console.log('\n3. Atualizando BRUNO...');
        const updateResponse = await fetch(`http://localhost:3000/api/employees/${bruno.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            notes: 'Teste SSE - ' + new Date().toLocaleTimeString()
          })
        });
        
        if (updateResponse.ok) {
          console.log('✅ BRUNO atualizado com sucesso');
          
          // 5. Aguardar evento SSE
          console.log('\n4. Aguardando evento SSE...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          if (eventReceived) {
            console.log('✅ SSE FUNCIONANDO - Evento recebido!');
          } else {
            console.log('❌ SSE NÃO FUNCIONANDO - Nenhum evento recebido');
            console.log('🔍 POSSÍVEIS CAUSAS:');
            console.log('- API não está emitindo eventos');
            console.log('- EventSource não está conectando');
            console.log('- URL do SSE incorreta');
            console.log('- Firewall/proxy bloqueando SSE');
          }
        } else {
          console.log('❌ Erro ao atualizar BRUNO:', updateResponse.status);
        }
      } else {
        console.log('❌ BRUNO não encontrado');
      }
    }
    
    eventSource.close();
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testSSEEvents(); 