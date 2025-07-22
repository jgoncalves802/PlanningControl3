import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {

    
    // Teste 1: Verificar se a API básica funciona

    
    // Teste 2: Verificar se o Prisma pode ser importado
    let prisma
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient

    } catch (importError) {
      console.error('Teste 2: Erro no import do Prisma:', importError)
      return NextResponse.json({ 
        error: 'Erro no import do Prisma', 
        details: importError.message,
        step: 'import' 
      }, { status: 500 })
    }
    
    // Teste 3: Verificar conexão com Prisma
    try {
      await prisma.$connect()

    } catch (connectionError) {
      console.error('Teste 3: Erro de conexão Prisma:', connectionError)
      return NextResponse.json({ 
        error: 'Erro de conexão Prisma', 
        details: connectionError.message,
        step: 'connection' 
      }, { status: 500 })
    }
    
    // Teste 4: Verificar se a tabela existe com query simples
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`

    } catch (queryError) {
      console.error('Teste 4: Erro query raw:', queryError)
      return NextResponse.json({ 
        error: 'Erro query raw', 
        details: queryError.message,
        step: 'raw_query' 
      }, { status: 500 })
    }
    
    // Teste 5: Verificar se a tabela Contract existe
    let contractCount
    try {
      contractCount = await prisma.contract.count()

    } catch (countError) {
      console.error('Teste 5: Erro ao contar contratos:', countError)
      return NextResponse.json({ 
        error: 'Erro ao contar contratos', 
        details: countError.message,
        step: 'contract_count' 
      }, { status: 500 })
    }
    
    // Teste 6: Buscar um contrato simples
    let firstContract
    try {
      firstContract = await prisma.contract.findFirst()

    } catch (findError) {
      console.error('Teste 6: Erro ao buscar contrato:', findError)
      return NextResponse.json({ 
        error: 'Erro ao buscar contrato', 
        details: findError.message,
        step: 'contract_find' 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Todos os testes passaram!',
      results: {
        contractCount,
        hasContracts: !!firstContract,
        firstContractId: firstContract?.id || null
      }
    })
    
  } catch (error) {
    console.error('Erro geral no debug:', error)
    return NextResponse.json({
      error: 'Erro geral',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
} 
