import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { broadcastWorkforceUpdate } from './sse/route'

export async function GET(request: NextRequest) {
  try {
    // Parse query params
    const { searchParams } = new URL(request.url)
    const contractId = searchParams.get('contractId')
    const date = searchParams.get('date') // formato yyyy-mm-dd
    const search = searchParams.get('search')
    let page = parseInt(searchParams.get('page') || '1', 10)
    if (isNaN(page) || page < 1) page = 1
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const status = searchParams.get('status')
    // Novo filtro de status
    let statusFilter = undefined;
    if (status) {
      const statusArray = status.split(',').map((s) => s.trim()).filter(Boolean);
      if (statusArray.length === 1) {
        statusFilter = statusArray[0];
      } else if (statusArray.length > 1) {
        statusFilter = { in: statusArray };
      }
    }
    const functionId = searchParams.get('functionId')
    const location = searchParams.get('location')
    const checkInTimeFrom = searchParams.get('checkInTimeFrom')
    const checkInTimeTo = searchParams.get('checkInTimeTo')
    const checkOutTimeFrom = searchParams.get('checkOutTimeFrom')
    const checkOutTimeTo = searchParams.get('checkOutTimeTo')

    // Montar filtro
    let where: any = {}
    // Novo: construir filtro de data e horário separadamente para checkInTime e checkOutTime
    let checkInFilters = [];
    let checkOutFilters = [];
    if (date) {
      const from = new Date(date + 'T00:00:00.000Z');
      const to = new Date(date + 'T23:59:59.999Z');
      checkInFilters.push({ checkInTime: { gte: from, lte: to } });
      checkOutFilters.push({ checkOutTime: { gte: from, lte: to } });
    }
    if (checkInTimeFrom) {
      const checkInFrom = date ? new Date(`${date}T${checkInTimeFrom}:00.000Z`) : new Date(`1970-01-01T${checkInTimeFrom}:00.000Z`);
      checkInFilters.push({ checkInTime: { gte: checkInFrom } });
    }
    if (checkInTimeTo) {
      const checkInTo = date ? new Date(`${date}T${checkInTimeTo}:59.999Z`) : new Date(`1970-01-01T${checkInTimeTo}:59.999Z`);
      checkInFilters.push({ checkInTime: { lte: checkInTo } });
    }
    if (checkOutTimeFrom) {
      const checkOutFrom = date ? new Date(`${date}T${checkOutTimeFrom}:00.000Z`) : new Date(`1970-01-01T${checkOutTimeFrom}:00.000Z`);
      checkOutFilters.push({ checkOutTime: { gte: checkOutFrom } });
    }
    if (checkOutTimeTo) {
      const checkOutTo = date ? new Date(`${date}T${checkOutTimeTo}:59.999Z`) : new Date(`1970-01-01T${checkOutTimeTo}:59.999Z`);
      checkOutFilters.push({ checkOutTime: { lte: checkOutTo } });
    }
    // Filtro de contrato
    let contractFilter = contractId ? [{ employee: { currentContractId: contractId } }] : [];
    // Combinar filtros: se houver filtro de check-in e/ou check-out, usar OR
    if (checkInFilters.length > 0 && checkOutFilters.length > 0) {
      where.OR = [
        { AND: [...checkInFilters, ...contractFilter] },
        { AND: [...checkOutFilters, ...contractFilter] }
      ];
    } else if (checkInFilters.length > 0) {
      where.AND = [...checkInFilters, ...contractFilter];
    } else if (checkOutFilters.length > 0) {
      where.AND = [...checkOutFilters, ...contractFilter];
    } else if (contractFilter.length > 0) {
      where.AND = contractFilter;
    }
    if (search) {
      where.OR = [
        { employee: { name: { contains: search, mode: 'insensitive' } } },
        { contractName: { contains: search, mode: 'insensitive' } },
        { employee: { companyFunction: { name: { contains: search, mode: 'insensitive' } } } },
      ]
    }
    if (statusFilter) {
      where.status = statusFilter;
    }
    if (functionId) {
      where.functionId = functionId
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    // Buscar total de registros
    const total = await prisma.workforceEntry.count({ where })

    // Buscar registros paginados
    const workforceEntries = await prisma.workforceEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            name: true,
            currentContractId: true,
            companyFunctionId: true,
            nfcCardId: true,
            registration: true,
            companyFunction: {
              select: { name: true }
            },
            currentContract: {
              select: { name: true }
            }
          }
        }
      },
      skip,
      take: limit,
    })

    // Se NÃO houver filtro de contrato/local, retornar estatísticas acumuladas (um único card global)
    if (!contractId && !location) {
      // Ponto de integração futura: filtrar por contratos permitidos do usuário
      // Exemplo: const allowedContracts = getUserAllowedContracts(userId)
      // ... e filtrar entries por esses contratos

      const stats = {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        left: 0
      };
      workforceEntries.forEach(entry => {
        stats.total++;
        switch (entry.status) {
          case 'PRESENT': stats.present++; break;
          case 'ABSENT': stats.absent++; break;
          case 'LATE': stats.late++; break;
          case 'LEFT': stats.left++; break;
        }
      });
      const totalPages = Math.ceil(total / limit);
      return NextResponse.json({
        globalStats: stats,
        total,
        page,
        totalPages,
        limit,
        entries: workforceEntries.map(entry => ({
          id: entry.id,
          employeeId: entry.employeeId,
          employeeName: entry.employee.name,
          contractId: entry.employee.currentContractId || '',
          contractName: entry.contractName || entry.employee.currentContract?.name || 'Sem Contrato',
          functionId: entry.employee.companyFunctionId || '',
          functionName: entry.employee.companyFunction?.name || '',
          checkInTime: entry.checkInTime,
          checkOutTime: entry.checkOutTime,
          status: entry.status,
          location: entry.location,
          nfcCardId: entry.employee.nfcCardId,
          isLate: entry.isLate,
          hoursWorked: entry.hoursWorked,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt
        }))
      }, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }

    // Agrupar por contrato (comportamento atual)
    const contractGroups = new Map()
    
    workforceEntries.forEach(entry => {
      const contractName = entry.contractName || entry.employee.currentContract?.name || 'Sem Contrato'
      const contractId = entry.employee.currentContractId || 'no-contract'
      
      if (!contractGroups.has(contractId)) {
        contractGroups.set(contractId, {
          contractId,
          contractName,
          entries: [],
          stats: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            left: 0
          }
        })
      }
      
      const group = contractGroups.get(contractId)
      const formattedEntry = {
        id: entry.id,
        employeeId: entry.employeeId,
        employeeName: entry.employee.name,
        contractId: entry.employee.currentContractId || '',
        contractName: entry.contractName || entry.employee.currentContract?.name || 'Sem Contrato',
        functionId: entry.employee.companyFunctionId || '',
        functionName: entry.employee.companyFunction?.name || '',
        checkInTime: entry.checkInTime,
        checkOutTime: entry.checkOutTime,
        status: entry.status,
        location: entry.location,
        nfcCardId: entry.employee.nfcCardId,
        isLate: entry.isLate,
        hoursWorked: entry.hoursWorked,
        employeeRegistration: entry.employee.registration || '',
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
      
      group.entries.push(formattedEntry)
      group.stats.total++
      
      // Calcular estatísticas por status
      switch (entry.status) {
        case 'PRESENT':
          group.stats.present++
          break
        case 'ABSENT':
          group.stats.absent++
          break
        case 'LATE':
          group.stats.late++
          break
        case 'LEFT':
          group.stats.left++
          break
      }
    })

    const contractGroupsArray = Array.from(contractGroups.values())
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      contractGroups: contractGroupsArray,
      total,
      page,
      totalPages,
      limit,
      // Manter compatibilidade com formato antigo
      entries: workforceEntries.map(entry => ({
        id: entry.id,
        employeeId: entry.employeeId,
        employeeName: entry.employee.name,
        contractId: entry.employee.currentContractId || '',
        contractName: entry.contractName || entry.employee.currentContract?.name || '',
        functionId: entry.employee.companyFunctionId || '',
        functionName: entry.employee.companyFunction?.name || '',
        checkInTime: entry.checkInTime,
        checkOutTime: entry.checkOutTime,
        status: entry.status,
        location: entry.location,
        nfcCardId: entry.employee.nfcCardId,
        isLate: entry.isLate,
        hoursWorked: entry.hoursWorked,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }))
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('=== DEBUG: Erro na API workforce:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar dados de efetivo', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {

    const body = await request.json()

    // ... lógica de criação real aqui ...
    // Após criar o registro:
    broadcastWorkforceUpdate();
    // Gravar log de auditoria
    try {
      const userId = null; // Se possível, obter do contexto de autenticação
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          entityId: 'workforceEntryId', // Substituir pelo id real quando implementar
          details: body,
        },
      });
    } catch (e) {
      console.error('[AUDIT] Falha ao registrar log de auditoria:', e);
    }
    return NextResponse.json({ message: 'Teste OK', body }, {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('=== DEBUG: Erro no POST workforce:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao criar registro de efetivo', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
} 
