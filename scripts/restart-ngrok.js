const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Reiniciando servidor para ngrok...');

// Função para matar processos na porta 3000
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'netstat' : 'lsof';
    const args = isWin ? ['-ano'] : ['-ti', `:${port}`];
    
    const process = spawn(cmd, args);
    
    process.stdout.on('data', (data) => {
      const output = data.toString();
      const lines = output.split('\n');
      
      lines.forEach(line => {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          const pid = isWin ? parts[parts.length - 1] : parts[1];
          if (pid && pid !== 'PID') {
            console.log(`🔄 Matando processo ${pid} na porta ${port}`);
            try {
              spawn('taskkill', ['/F', '/PID', pid]);
            } catch (error) {
              console.log('Processo já foi finalizado');
            }
          }
        }
      });
    });
    
    process.on('close', () => {
      setTimeout(resolve, 1000);
    });
  });
}

// Função para iniciar o servidor Next.js
function startNextServer() {
  console.log('🚀 Iniciando servidor Next.js...');
  
  const nextProcess = spawn('npm', ['run', 'dev:ngrok'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      HOSTNAME: '0.0.0.0',
      PORT: '3000'
    }
  });
  
  nextProcess.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
  });
  
  return nextProcess;
}

// Função para iniciar ngrok
function startNgrok() {
  console.log('🌐 Iniciando ngrok...');
  
  setTimeout(() => {
    const ngrokProcess = spawn('npx', ['ngrok', 'http', '3000'], {
      stdio: 'inherit',
      shell: true
    });
    
    ngrokProcess.on('error', (error) => {
      console.error('❌ Erro ao iniciar ngrok:', error);
    });
  }, 5000); // Aguardar 5 segundos para o servidor inicializar
}

// Função principal
async function main() {
  try {
    // 1. Matar processos na porta 3000
    console.log('🔄 Verificando processos na porta 3000...');
    await killProcessOnPort(3000);
    
    // 2. Iniciar servidor Next.js
    const nextProcess = startNextServer();
    
    // 3. Iniciar ngrok após delay
    startNgrok();
    
    // 4. Configurar handlers de saída
    process.on('SIGINT', () => {
      console.log('\n🛑 Parando servidor...');
      nextProcess.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Parando servidor...');
      nextProcess.kill('SIGTERM');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executar
main(); 