import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RecordSource, WorkforceStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { nfcCardId, timestamp, action, location } = await req.json();
    if (!nfcCardId || !timestamp || !action) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes.' }, { status: 400 });
    }

    // 1. Buscar funcionário pelo campo direto
    let employee = await prisma.employee.findFirst({
      where: {
        nfcCardId,
        isActive: true,
      },
      include: { currentContract: true, companyFunction: true },
    });

    // 2. Se não encontrar, buscar pela relação com NFCBadge
    if (!employee) {
      const badge = await prisma.nFCBadge.findFirst({
        where: {
          badgeId: nfcCardId,
          status: 'ASSIGNED',
          isActive: true,
          employee: { isActive: true },
        },
        include: { employee: { include: { currentContract: true, companyFunction: true } } },
      });
      employee = badge?.employee || null;
    }

    if (!employee) {
      return NextResponse.json({ error: 'Funcionário não encontrado ou inativo para este crachá.' }, { status: 404 });
    }

    // Data do registro (apenas data, sem hora)
    const dateObj = new Date(timestamp);
    const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

    // Buscar registro de ponto do dia
    let timeRecord = await prisma.timeRecord.findFirst({
      where: {
        employeeId: employee.id,
        date: dateOnly,
        source: 'NFC_PROCESSED',
      },
    });

    let isLate = false;
    let status: WorkforceStatus = 'PRESENT';
    let checkInTime: Date | null = null;
    let checkOutTime: Date | null = null;
    let hoursWorked: number | null = null;

    if (action === 'check_in') {
      if (timeRecord && timeRecord.clockIn) {
        return NextResponse.json({ error: 'Check-in já registrado para este funcionário hoje.' }, { status: 409 });
      }
      if (timeRecord) {
        // Atualizar clockIn se registro já existe
        timeRecord = await prisma.timeRecord.update({
          where: { id: timeRecord.id },
          data: { clockIn: dateObj },
        });
      } else {
        // Criar novo registro
        timeRecord = await prisma.timeRecord.create({
          data: {
            employeeId: employee.id,
            date: dateOnly,
            clockIn: dateObj,
            source: 'NFC_PROCESSED',
            isEdited: false,
          },
        });
      }
      // Lógica de atraso (exemplo: após 08:15)
      const lateThreshold = new Date(dateOnly);
      lateThreshold.setHours(8, 15, 0, 0);
      isLate = dateObj > lateThreshold;
      status = isLate ? 'LATE' : 'PRESENT';
      checkInTime = dateObj;
    } else if (action === 'check_out') {
      if (!timeRecord || !timeRecord.clockIn) {
        return NextResponse.json({ error: 'Nenhum check-in encontrado para este funcionário hoje.' }, { status: 404 });
      }
      if (timeRecord.clockOut) {
        return NextResponse.json({ error: 'Check-out já registrado para este funcionário hoje.' }, { status: 409 });
      }
      // Atualizar registro de saída
      timeRecord = await prisma.timeRecord.update({
        where: { id: timeRecord.id },
        data: { clockOut: dateObj },
      });
      checkInTime = timeRecord.clockIn;
      checkOutTime = dateObj;
      status = 'LEFT';
      if (checkInTime && checkOutTime) {
        hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      }
    } else {
      return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
    }

    // --- Sincronizar WorkforceEntry com dados completos do funcionário ---
    let workforceEntry = await prisma.workforceEntry.findFirst({
      where: {
        employeeId: employee.id,
        // Um por dia (usando createdAt do dia)
        createdAt: {
          gte: dateOnly,
          lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });
    
    // Correlacionar dados automaticamente baseado na alocação do funcionário
    const contractName = employee.currentContract?.name || '';
    const contractId = employee.currentContractId || null;
    const functionName = employee.companyFunction?.name || '';
    const functionId = employee.companyFunctionId || null;
    
    // Dados para sincronização automática
    const workforceData = {
      checkInTime: checkInTime || (workforceEntry?.checkInTime || null),
      checkOutTime: checkOutTime || (workforceEntry?.checkOutTime || null),
      status,
      isLate,
      hoursWorked: hoursWorked !== null ? hoursWorked : (workforceEntry?.hoursWorked || 0),
      contractName,
      location: location || workforceEntry?.location || '',
      // Campos adicionais para correlação completa
      contractId,
      functionName,
      functionId,
      employeeName: employee.name,
      employeeRegistration: employee.registration || '',
      nfcCardId: employee.nfcCardId || nfcCardId,
    };
    
    if (workforceEntry) {
      workforceEntry = await prisma.workforceEntry.update({
        where: { id: workforceEntry.id },
        data: workforceData,
      });
    } else {
      workforceEntry = await prisma.workforceEntry.create({
        data: {
          employeeId: employee.id,
          ...workforceData,
        },
      });
    }

    // Retornar dados do registro
    return NextResponse.json({
      id: timeRecord.id,
      employeeId: timeRecord.employeeId,
      date: timeRecord.date,
      clockIn: timeRecord.clockIn,
      clockOut: timeRecord.clockOut,
      source: timeRecord.source,
      isEdited: timeRecord.isEdited,
      action,
      employeeName: employee.name,
      // WorkforceEntry info
      workforceEntryId: workforceEntry.id,
      status: workforceEntry.status,
      isLate: workforceEntry.isLate,
      hoursWorked: workforceEntry.hoursWorked,
      contractName: workforceEntry.contractName,
      location: workforceEntry.location,
    });
  } catch (error) {
    console.error('[NFC] Erro no registro de ponto:', error);
    return NextResponse.json({ error: 'Erro interno ao registrar ponto.' }, { status: 500 });
  }
} 