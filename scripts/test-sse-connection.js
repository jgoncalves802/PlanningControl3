async function testSSEConnection() {
  console.log('🧪 Testando Conexão SSE...');

  try {
    // Testar se o endpoint SSE está respondendo
    console.log('1. Testando endpoint SSE...');
    const response = await fetch('http://localhost:3000/api/employees/events', {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ Endpoint SSE está respondendo');
      
      // Ler algumas linhas da resposta
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      console.log('\n2. Lendo dados SSE...');
      let timeout = setTimeout(() => {
        console.log('⏰ Timeout - fechando conexão');
        reader.cancel();
      }, 5000);
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          console.log('📨 Dados recebidos:', chunk);
          
          if (chunk.includes('data:') || chunk.includes('event:')) {
            console.log('✅ SSE está enviando dados formatados');
            break;
          }
        }
      } catch (error) {
        console.log('ℹ️ Conexão fechada:', error.message);
      }
      
      clearTimeout(timeout);
      
    } else {
      console.log('❌ Endpoint SSE não está respondendo:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar SSE:', error.message);
  }
}

testSSEConnection(); 