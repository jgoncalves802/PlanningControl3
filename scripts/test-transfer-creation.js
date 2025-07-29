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

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTransferCreation() {
  try {
    console.log('🧪 Testando Criação de Transferências com Usuário Correto')
    console.log('========================================================')
    console.log('')

    // 1. Verificar usuários disponíveis
    console.log('👥 Verificando usuários disponíveis...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (users.length === 0) {
      console.error('❌ Nenhum usuário encontrado no banco de dados')
      return
    }

    console.log(`✅ ${users.length} usuário(s) encontrado(s):`)
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`)
    })
    console.log('')

    // 2. Verificar funcionários disponíveis
    console.log('👷 Verificando funcionários disponíveis...')
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        cpf: true,
        currentFunctionId: true,
        companyFunctionId: true
      },
      take: 5
    })

    if (employees.length === 0) {
      console.error('❌ Nenhum funcionário ativo encontrado')
      return
    }

    console.log(`✅ ${employees.length} funcionário(s) encontrado(s):`)
    employees.forEach((employee, index) => {
      console.log(`   ${index + 1}. ${employee.name} (${employee.cpf})`)
      console.log(`      Função atual: ${employee.currentFunctionId || 'N/A'}`)
      console.log(`      Função empresa: ${employee.companyFunctionId || 'N/A'}`)
    })
    console.log('')

    // 3. Verificar contratos disponíveis
    console.log('📋 Verificando contratos disponíveis...')
    const contracts = await prisma.contract.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true
      },
      take: 5
    })

    if (contracts.length === 0) {
      console.error('❌ Nenhum contrato ativo encontrado')
      return
    }

    console.log(`✅ ${contracts.length} contrato(s) encontrado(s):`)
    contracts.forEach((contract, index) => {
      console.log(`   ${index + 1}. ${contract.name} (${contract.code}) - ID: ${contract.id}`)
    })
    console.log('')

    // 4. Testar criação de transferência
    console.log('🔄 Testando criação de transferência...')
    
    const testUser = users[0] // Usar o primeiro usuário
    const testEmployee = employees[0] // Usar o primeiro funcionário
    const testContract = contracts[0] // Usar o primeiro contrato
    
    // Verificar se o funcionário tem função
    if (!testEmployee.currentFunctionId && !testEmployee.companyFunctionId) {
      console.log('⚠️  Funcionário não tem função definida, pulando teste')
      return
    }

    const transferData = {
      employeeId: testEmployee.id,
      toContractId: testContract.id,
      toFunctionId: testEmployee.currentFunctionId || testEmployee.companyFunctionId,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias no futuro
      requestedById: testUser.id
    }

    console.log('📤 Dados da transferência:')
    console.log(`   Funcionário: ${testEmployee.name}`)
    console.log(`   Contrato destino: ${testContract.name}`)
    console.log(`   Função: ${transferData.toFunctionId}`)
    console.log(`   Data agendada: ${transferData.scheduledDate}`)
    console.log(`   Solicitado por: ${testUser.name}`)
    console.log('')

    // Simular chamada da API
    const transferRequest = await prisma.transferRequest.create({
      data: {
        employeeId: transferData.employeeId,
        toContractId: transferData.toContractId,
        toFunctionId: transferData.toFunctionId,
        requestedById: transferData.requestedById,
        scheduledDate: new Date(transferData.scheduledDate),
        status: 'PENDING',
      },
      include: {
        employee: { select: { id: true, name: true, registration: true, cpf: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
      },
    })

    console.log('✅ Transferência criada com sucesso!')
    console.log(`   ID: ${transferRequest.id}`)
    console.log(`   Status: ${transferRequest.status}`)
    console.log(`   Solicitado por: ${transferRequest.requestedBy.name} (${transferRequest.requestedBy.email})`)
    console.log('')

    // 5. Verificar transferência criada
    console.log('🔍 Verificando transferência criada...')
    const createdTransfer = await prisma.transferRequest.findUnique({
      where: { id: transferRequest.id },
      include: {
        employee: { select: { id: true, name: true, registration: true, cpf: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
      },
    })

    if (createdTransfer) {
      console.log('✅ Transferência encontrada no banco:')
      console.log(`   ID: ${createdTransfer.id}`)
      console.log(`   Funcionário: ${createdTransfer.employee.name}`)
      console.log(`   Contrato: ${createdTransfer.toContractId}`)
      console.log(`   Função: ${createdTransfer.toFunctionId}`)
      console.log(`   Status: ${createdTransfer.status}`)
      console.log(`   Solicitado por: ${createdTransfer.requestedBy.name}`)
      console.log(`   Data agendada: ${createdTransfer.scheduledDate.toISOString()}`)
    } else {
      console.error('❌ Transferência não encontrada no banco')
    }

    // 6. Limpar dados de teste
    console.log('')
    console.log('🧹 Limpando dados de teste...')
    await prisma.transferRequest.delete({
      where: { id: transferRequest.id }
    })
    console.log('✅ Dados de teste removidos')

    console.log('')
    console.log('🎉 Teste de criação de transferência concluído com sucesso!')
    console.log('')
    console.log('📋 Resumo:')
    console.log('   ✅ Usuários verificados')
    console.log('   ✅ Funcionários verificados')
    console.log('   ✅ Contratos verificados')
    console.log('   ✅ Transferência criada')
    console.log('   ✅ Dados validados')
    console.log('   ✅ Limpeza realizada')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
    console.log('')
    console.log('💡 Verifique:')
    console.log('   1. Se o banco de dados está acessível')
    console.log('   2. Se existem usuários, funcionários e contratos')
    console.log('   3. Se as permissões estão corretas')
  } finally {
    await prisma.$disconnect()
  }
}

// Executar teste
testTransferCreation() 