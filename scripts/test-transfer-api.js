const fs = require('fs')
const path = require('path')

// Carregar variáveis de ambiente do .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envLines = envContent.split('\n')
  
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      if (value && !key.startsWith('#')) {
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '')
      }
    }
  })
}

async function testTransferAPI() {
  try {
    console.log('🧪 Testando API de Transferências')
    console.log('=================================')
    console.log('')

    const baseUrl = 'http://localhost:3001'

    // Teste 1: Buscar todas as transferências
    console.log('📡 Teste 1: Buscar todas as transferências')
    console.log(`URL: ${baseUrl}/api/transfer-requests`)
    console.log('')

    const response1 = await fetch(`${baseUrl}/api/transfer-requests`)
    
    if (!response1.ok) {
      console.error(`❌ Erro HTTP: ${response1.status} ${response1.statusText}`)
      return
    }

    const data1 = await response1.json()
    
    console.log('✅ Resposta da API:')
    console.log(`   Status: ${response1.status}`)
    console.log(`   Total de transferências: ${data1.transferRequests?.length || 0}`)
    console.log(`   Paginação: ${JSON.stringify(data1.pagination)}`)
    console.log('')

    if (data1.transferRequests && data1.transferRequests.length > 0) {
      console.log('📋 Transferências encontradas:')
      data1.transferRequests.forEach((transfer, index) => {
        console.log(`   ${index + 1}. ID: ${transfer.id}`)
        console.log(`      Funcionário: ${transfer.employee?.name || 'N/A'}`)
        console.log(`      Status: ${transfer.status}`)
        console.log(`      Solicitado por: ${transfer.requestedBy?.name || 'N/A'}`)
        console.log('')
      })
    } else {
      console.log('❌ Nenhuma transferência retornada pela API')
    }

    // Teste 2: Buscar com filtros específicos
    console.log('📡 Teste 2: Buscar com filtros específicos')
    console.log(`URL: ${baseUrl}/api/transfer-requests?status=PENDING&limit=5`)
    console.log('')

    const response2 = await fetch(`${baseUrl}/api/transfer-requests?status=PENDING&limit=5`)
    
    if (!response2.ok) {
      console.error(`❌ Erro HTTP: ${response2.status} ${response2.statusText}`)
      return
    }

    const data2 = await response2.json()
    
    console.log('✅ Resposta da API (com filtros):')
    console.log(`   Status: ${response2.status}`)
    console.log(`   Total de transferências: ${data2.transferRequests?.length || 0}`)
    console.log(`   Paginação: ${JSON.stringify(data2.pagination)}`)
    console.log('')

    // Teste 3: Verificar se há problemas de CORS ou headers
    console.log('📡 Teste 3: Verificar headers da resposta')
    console.log('')

    console.log('Headers da resposta:')
    response1.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`)
    })
    console.log('')

    // Teste 4: Verificar se o servidor está rodando
    console.log('📡 Teste 4: Verificar se o servidor está rodando')
    console.log(`URL: ${baseUrl}/api/health`)
    console.log('')

    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`)
      console.log(`✅ Servidor respondendo: ${healthResponse.status}`)
    } catch (error) {
      console.log(`❌ Servidor não está rodando: ${error.message}`)
      console.log('')
      console.log('💡 Para resolver:')
      console.log('   1. Inicie o servidor: npm run dev')
      console.log('   2. Verifique se está rodando na porta 3001')
      console.log('   3. Tente novamente')
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
    console.log('')
    console.log('💡 Verifique:')
    console.log('   1. Se o servidor está rodando')
    console.log('   2. Se a porta 3001 está correta')
    console.log('   3. Se não há problemas de rede')
  }
}

// Executar teste
testTransferAPI() 