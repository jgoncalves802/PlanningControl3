import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SSEClient {
  controller: ReadableStreamDefaultController;
  isActive: boolean;
  clientId: string;
  encoder: TextEncoder;
  cleanup: () => void;
}

const clients = new Map<string, SSEClient>();

function isControllerActive(controller: ReadableStreamDefaultController): boolean {
  try {
    return controller.desiredSize !== null;
  } catch {
    return false;
  }
}

function sendEventToClient(client: SSEClient, data: any, event = 'message'): boolean {
  if (!client.isActive || !clients.has(client.clientId) || !isControllerActive(client.controller)) {
    client.cleanup();
    return false;
  }
  try {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    client.controller.enqueue(client.encoder.encode(message));
    return true;
  } catch (error) {
    client.isActive = false;
    client.cleanup();
    console.error(`[SSE] Error sending to client ${client.clientId}:`, error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  let heartbeat: NodeJS.Timeout | undefined;
  let cleanedUp = false;
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = undefined;
        }
        clients.delete(clientId);
        try {
          if (isControllerActive(controller)) {
            controller.close();
          }
        } catch {}
      };
      const client: SSEClient = {
        controller,
        isActive: true,
        clientId,
        encoder,
        cleanup,
      };
      clients.set(clientId, client);

      sendEventToClient(client, { type: 'connected', clientId, timestamp: new Date().toISOString() }, 'connection');
      request.signal.addEventListener('abort', () => {
        client.isActive = false;
        client.cleanup();

      });
      heartbeat = setInterval(() => {
        if (!clients.has(clientId) || !client.isActive) return;
        if (!sendEventToClient(client, { type: 'heartbeat', timestamp: new Date().toISOString() }, 'heartbeat')) {
          client.isActive = false;
          client.cleanup();

        }
      }, 30000);
    },
    cancel() {
      const client = clients.get(clientId);
      if (client) {
        client.isActive = false;
        client.cleanup();
      }
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}

export async function broadcastNFCBadgeUpdate(
  eventType: 'create' | 'update' | 'assign' | 'revoke' | 'delete',
  badgeData: any
) {
  const message = {
    type: 'nfc-badge-update',
    eventType,
    data: badgeData,
    timestamp: new Date().toISOString(),
  };

  // Itera sobre uma cópia dos clientes
  for (const [clientId, client] of Array.from(clients)) {
    if (!clients.has(clientId)) continue;
    sendEventToClient(client, message, 'nfc-badge-update');
  }

}

export async function broadcastStatsUpdate(stats: any) {
  const message = {
    type: 'stats-update',
    data: stats,
    timestamp: new Date().toISOString(),
  };

  for (const [clientId, client] of Array.from(clients)) {
    if (!clients.has(clientId)) continue;
    sendEventToClient(client, message, 'stats-update');
  }

}

export { clients }; 
