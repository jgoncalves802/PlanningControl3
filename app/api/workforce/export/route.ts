import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Parser as Json2CsvParser } from 'json2csv';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'csv';
  const contractId = searchParams.get('contractId');
  const date = searchParams.get('date');
  const status = searchParams.get('status');

  // Montar filtros
  const where: any = {};
  if (contractId) where.contractId = contractId;
  if (status) where.status = status;
  if (date) {
    // Considera apenas registros do dia
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.checkInTime = { gte: start, lte: end };
  }

  // Buscar dados (sem include extra)
  const entries = await prisma.workforceEntry.findMany({
    where,
    orderBy: { checkInTime: 'asc' },
  });

  // Mapear para exportação
  const exportData = entries.map((entry) => ({
    Nome: entry.employeeName || '',
    Matricula: entry.employeeRegistration || '',
    Contrato: entry.contractName || '',
    Funcao: entry.functionName || '',
    Crachá: entry.nfcCardId || '',
    Status: entry.status || '',
    'Entrada': entry.checkInTime ? new Date(entry.checkInTime).toLocaleString('pt-BR') : '',
    'Saída': entry.checkOutTime ? new Date(entry.checkOutTime).toLocaleString('pt-BR') : '',
    'Última atualização': entry.updatedAt ? new Date(entry.updatedAt).toLocaleString('pt-BR') : '',
  }));

  if (format === 'xlsx') {
    // Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Efetivo');
    worksheet.columns = Object.keys(exportData[0] || {}).map((key) => ({ header: key, key }));
    worksheet.addRows(exportData);
    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="efetivo.xlsx"',
      },
    });
  } else {
    // CSV
    const parser = new Json2CsvParser({ delimiter: ';' });
    const csv = parser.parse(exportData);
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="efetivo.csv"',
      },
    });
  }
} 