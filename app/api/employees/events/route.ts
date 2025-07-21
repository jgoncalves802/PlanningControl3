import { NextRequest } from 'next/server';

let clients = new Set<any>();

function sendEvent(data: any, event: string = 'employee-update') {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  console.log(`[SSE] Sending event: ${event}`, data);
  for (const client of clients) {
    try {
      client.write(payload);
    } catch (error) {
      console.error('[SSE] Error sending to client:', error);
    }
  }
}

export async function GET(req: NextRequest) {
  console.log('[SSE] New client connecting...');
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const client = {
        write: (data: string) => {
          try {
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            console.error('[SSE] Error writing to client:', error);
          }
        },
        close: () => controller.close(),
      };
      
      clients.add(client);
      console.log(`[SSE] Client connected. Total clients: ${clients.size}`);
      
      // Evento de conexão
      client.write(`event: connection\ndata: {\"status\":\"connected\"}\n\n`);
      
      req.signal.addEventListener('abort', () => {
        console.log('[SSE] Client disconnected');
        clients.delete(client);
        client.close();
      });
    },
    cancel() {
      console.log('[SSE] Stream cancelled');
      // Cleanup
      clients.clear();
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Função utilitária para ser chamada no backend ao criar/atualizar/excluir funcionário
export function emitEmployeeEvent(type: 'created' | 'updated' | 'deleted', employee: any) {
  console.log(`[SSE] Emitting employee event: ${type}`, { employeeId: employee.id, employeeName: employee.name });
  sendEvent({ type, employee }, 'employee-update');
} 