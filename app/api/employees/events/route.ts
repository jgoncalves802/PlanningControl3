import { NextRequest } from 'next/server';

let clients = new Set<any>();

function sendEvent(data: any, event: string = 'employee-update') {
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
      client.write(`event: connection\ndata: {\"status\":\"connected\"}\n\n`);
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

// Função utilitária para ser chamada no backend ao criar/atualizar/excluir funcionário
export function emitEmployeeEvent(type: 'created' | 'updated' | 'deleted', employee: any) {
  sendEvent({ type, employee }, 'employee-update');
} 