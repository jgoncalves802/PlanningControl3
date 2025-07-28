import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const encoder = new TextEncoder();
let clients: { controller: ReadableStreamDefaultController }[] = [];

export async function GET(req: Request) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('event: ping\ndata: conectado\n\n'));
      clients.push({ controller });
    },
    cancel() {
      // Apenas remove todos os clientes (ou poderia ser noop)
      // A limpeza real é feita em broadcast ao detectar erro
      // clients = [];
    }
  });

  return new Response(stream, { headers });
}

export function broadcastWorkforceUpdate() {
  clients.forEach(({ controller }) => {
    try {
      controller.enqueue(encoder.encode('event: update\ndata: {}\n\n'));
    } catch (e) {
      // Remove clientes desconectados
      clients = clients.filter(c => c.controller !== controller);
    }
  });
} 
