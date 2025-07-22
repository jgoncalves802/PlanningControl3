import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Removido import não usado
import { z } from 'zod';

// Schema para validar dados de scan
const NFCScanSchema = z.object({
  badgeId: z.string().min(1, 'ID do crachá é obrigatório'),
  location: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

// POST /api/nfc-badges/scan - Processar leitura de crachá NFC
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = NFCScanSchema.parse(body);

    // Buscar crachá pelo badgeId
    const badge = await prisma.nFCBadge.findUnique({
      where: { badgeId: validatedData.badgeId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            cpf: true,
            registration: true,
            company: true,
            isActive: true,
            currentContract: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            companyFunction: {
              select: {
                id: true,
                name: true,
                laborType: true,
              },
            },
          },
        },
      },
    });

    if (!badge) {
      return NextResponse.json(
        { 
          error: 'Crachá não encontrado',
          badgeId: validatedData.badgeId,
          status: 'NOT_FOUND',
        },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    if (!badge.isActive) {
      return NextResponse.json(
        { 
          error: 'Crachá inativo',
          badgeId: validatedData.badgeId,
          status: 'INACTIVE',
          badge,
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    if (badge.status !== 'ASSIGNED') {
      return NextResponse.json(
        { 
          error: 'Crachá não está atribuído a nenhum funcionário',
          badgeId: validatedData.badgeId,
          status: 'NOT_ASSIGNED',
          badge,
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    if (!badge.employee) {
      return NextResponse.json(
        { 
          error: 'Funcionário não encontrado',
          badgeId: validatedData.badgeId,
          status: 'EMPLOYEE_NOT_FOUND',
          badge,
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    if (!badge.employee.isActive) {
      return NextResponse.json(
        { 
          error: 'Funcionário inativo',
          badgeId: validatedData.badgeId,
          status: 'EMPLOYEE_INACTIVE',
          badge,
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // Verificar se já existe entrada de workforce para hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingEntry = await prisma.workforceEntry.findFirst({
      where: {
        employeeId: badge.employee.id,
        createdAt: {
          gte: today,
        },
      },
    });

    const scanTimestamp = validatedData.timestamp ? new Date(validatedData.timestamp) : new Date();

    if (existingEntry) {
      // Atualizar entrada existente (check-out)
      const updatedEntry = await prisma.workforceEntry.update({
        where: { id: existingEntry.id },
        data: {
          checkOutTime: scanTimestamp,
          status: 'LEFT',
          location: validatedData.location,
          hoursWorked: existingEntry.checkInTime 
            ? Math.round((scanTimestamp.getTime() - existingEntry.checkInTime.getTime()) / (1000 * 60 * 60) * 100) / 100
            : 0,
        },
      });

      return NextResponse.json({
        success: true,
        action: 'CHECK_OUT',
        badgeId: validatedData.badgeId,
        employee: badge.employee,
        entry: updatedEntry,
        message: `Check-out realizado para ${badge.employee.name}`,
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    } else {
      // Criar nova entrada (check-in)
      const newEntry = await prisma.workforceEntry.create({
        data: {
          employeeId: badge.employee.id,
          checkInTime: scanTimestamp,
          status: 'PRESENT',
          location: validatedData.location,
          contractName: badge.employee.currentContract?.name || 'N/A',
        },
      });

      return NextResponse.json({
        success: true,
        action: 'CHECK_IN',
        badgeId: validatedData.badgeId,
        employee: badge.employee,
        entry: newEntry,
        message: `Check-in realizado para ${badge.employee.name}`,
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    console.error('Erro ao processar scan NFC:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
} 
