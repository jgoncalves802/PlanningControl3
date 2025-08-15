import { NextRequest, NextResponse } from 'next/server'
import type { User } from '@/lib/types/user'

// Definir os novos tipos de role
type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER'
import { PrismaClient } from '@prisma/client'
import { autoCorrectFunctionData } from '@/lib/csvEncodingUtils'

const prisma = new PrismaClient()

// Função para obter usuário atual no servidor (mock para desenvolvimento)
function getCurrentUser(req?: NextRequest): User {
  // Em produção, isso viria do token JWT nos headers ou cookies
  // Por enquanto, retornamos um usuário mock para desenvolvimento
  return {
    id: '1',
    name: 'Admin Geral',
    email: 'admin@demo-company.com',
    role: 'COMPANY_ADMIN' as UserRole,
    isActive: true,
    companyLogo: '/logo-demo-company.png'
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const user = getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar permissões (temporariamente desabilitado até implementar novo sistema)
    // if (!validateUserAccess(user, 'MANAGE_EMPLOYEES')) {
    //   return NextResponse.json({ error: 'Sem permissão para gerenciar funções' }, { status: 403 })
    // }

    const body = await req.json()
    const { functions } = body

    if (!functions || !Array.isArray(functions)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const results = {
      success: 0,
      errors: [] as string[],
      duplicates: [] as string[],
      created: [] as string[]
    }

    // Processar cada função
    for (let i = 0; i < functions.length; i++) {
      const func = functions[i]
      const rowNumber = i + 2 // +2 porque linha 1 é header e começamos do 0

      try {
        // Aplicar correção automática de caracteres especiais
        const { correctedData, corrections } = autoCorrectFunctionData(func)
        
        // Log das correções aplicadas (para debug)
        if (corrections.length > 0) {
          console.log(`Correções aplicadas para função ${rowNumber}:`, corrections)
        }
        
        // Validar dados obrigatórios (usando dados corrigidos)
        if (!correctedData.name || typeof correctedData.name !== 'string' || correctedData.name.trim() === '') {
          results.errors.push(`Linha ${rowNumber}: Nome da função é obrigatório`)
          continue
        }

        if (!correctedData.laborType || typeof correctedData.laborType !== 'string' || !['DIRETO', 'INDIRETO'].includes(correctedData.laborType.toUpperCase())) {
          results.errors.push(`Linha ${rowNumber}: Tipo de mão de obra deve ser "DIRETO" ou "INDIRETO"`)
          continue
        }

        // Normalizar e limpar nome (preservar caracteres especiais, mas limpar espaços)
        const normalizedName = correctedData.name.trim().toUpperCase()
        
        // Validar se o nome não está vazio após limpeza
        if (normalizedName === '') {
          results.errors.push(`Linha ${rowNumber}: Nome da função não pode estar vazio`)
          continue
        }

        // Verificar se já existe (comparação case-insensitive)
        const existingFunction = await prisma.companyFunction.findFirst({
          where: {
            name: normalizedName
          }
        })

        if (existingFunction) {
          results.duplicates.push(`Linha ${rowNumber}: Função "${normalizedName}" já existe`)
          continue
        }

        // Criar função (isActive sempre true por padrão)
        await prisma.companyFunction.create({
          data: {
            name: normalizedName,
            laborType: correctedData.laborType.toUpperCase(),
            isActive: true // Sempre ativo por padrão
          }
        })

        results.success++
        results.created.push(normalizedName)

      } catch (error) {
        console.error(`Erro ao processar linha ${rowNumber}:`, error)
        results.errors.push(`Linha ${rowNumber}: Erro interno do servidor`)
      }
    }

    return NextResponse.json({
      message: 'Importação concluída',
      results
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

  } catch (error) {
    console.error('Erro na importação de funções:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para download do modelo
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação
    const user = getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Modelo CSV otimizado para Excel
    const csvContent = `Nome da Função,Tipo de Mão de Obra
"ENGENHEIRO CIVIL","INDIRETO"
"PEDREIRO","DIRETO"
"SOLDADOR","DIRETO"
"ASSISTENTE ADMINISTRATIVO","INDIRETO"
"OPERADOR DE MÁQUINAS","DIRETO"
"SUPERVISOR DE OBRAS","INDIRETO"
"TÉCNICO EM SEGURANÇA","INDIRETO"
"CARPINTEIRO","DIRETO"
"ELETRICISTA","DIRETO"
"ENCARREGADO DE OBRAS","INDIRETO"`

    // Adicionar BOM (Byte Order Mark) para melhor compatibilidade com Excel
    const bom = '\uFEFF'
    const finalContent = bom + csvContent

    return new Response(finalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="modelo-importacao-funcoes.csv"'
      }
    })

  } catch (error) {
    console.error('Erro ao gerar modelo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
