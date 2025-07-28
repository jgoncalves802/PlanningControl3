import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
export const revalidate = 0;

let clients = new Set<any>();

function sendEvent(data: any, event: string = 'contract-update') {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {}
  }
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const client = {
        write: (data: string) => controller.enqueue(encoder.encode(data)),
        close: () => controller.close(),
      };
      clients.add(client);
      // Evento de conexão
      client.write(`event: connection\ndata: {"status":"connected"}\n\n`);
      req.signal.addEventListener('abort', () => {
        clients.delete(client);
        client.close();
      });
    },
    cancel() {
      // Cleanup
      clients.clear();
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// Função utilitária para ser chamada no backend ao criar/atualizar/excluir contrato
export function emitContractEvent(type: 'created' | 'updated' | 'deleted', contract: any) {
  sendEvent({ type, contract }, 'contract-update');
} 
