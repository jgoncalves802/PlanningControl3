import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Store active connections with their controllers and state
interface SSEClient {
  controller: ReadableStreamDefaultController;
  isActive: boolean;
  clientId: string;
  encoder: TextEncoder;
}

const clients = new Map<string, SSEClient>();

// Helper function to check if controller is still active
function isControllerActive(controller: ReadableStreamDefaultController): boolean {
  try {
    // Try to get the desired size - if controller is closed, this will throw
    return controller.desiredSize !== null;
  } catch {
    return false;
  }
}

// Helper function to safely send event to a client
function sendEventToClient(client: SSEClient, data: any, event = 'message'): boolean {
  if (!client.isActive || !isControllerActive(client.controller)) {
    return false;
  }

  try {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    client.controller.enqueue(client.encoder.encode(message));
    return true;
  } catch (error) {
    console.error(`[SSE] Error sending to client ${client.clientId}:`, error);
    client.isActive = false;
    return false;
  }
}

export async function GET(request: NextRequest) {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Create client object
      const client: SSEClient = {
        controller,
        isActive: true,
        clientId,
        encoder,
      };

      // Store this client connection
      clients.set(clientId, client);
      console.log(`[SSE] Client ${clientId} connected. Total clients: ${clients.size}`);

      // Send initial connection confirmation
      sendEventToClient(client, { type: 'connected', clientId, timestamp: new Date().toISOString() }, 'connection');
      
      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        client.isActive = false;
        clients.delete(clientId);
        console.log(`[SSE] Client ${clientId} disconnected. Total clients: ${clients.size}`);
        try {
          if (isControllerActive(controller)) {
            controller.close();
          }
        } catch (e) {
          // Connection already closed
        }
      });

      // Send periodic heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        if (!sendEventToClient(client, { type: 'heartbeat', timestamp: new Date().toISOString() }, 'heartbeat')) {
          // Client is no longer active, cleanup
          clearInterval(heartbeat);
          client.isActive = false;
          clients.delete(clientId);
          console.log(`[SSE] Client ${clientId} removed due to heartbeat failure. Total clients: ${clients.size}`);
        }
      }, 30000); // 30 seconds heartbeat

      // Cleanup on close
      const cleanup = () => {
        clearInterval(heartbeat);
        client.isActive = false;
        clients.delete(clientId);
      };

      // Store cleanup function for potential use
      (controller as any).cleanup = cleanup;
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

// Function to broadcast updates to all connected clients
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

  console.log(`[SSE] Broadcasting ${eventType} to ${clients.size} clients:`, badgeData.badgeId);
  
  // Send to all connected clients and cleanup inactive ones
  const clientsToRemove: string[] = [];
  
  for (const [clientId, client] of clients) {
    if (!sendEventToClient(client, message, 'nfc-badge-update')) {
      clientsToRemove.push(clientId);
    }
  }
  
  // Remove failed connections
  for (const clientId of clientsToRemove) {
    clients.delete(clientId);
    console.log(`[SSE] Removed inactive client ${clientId}`);
  }
  
  console.log(`[SSE] Broadcast completed. Active clients: ${clients.size}`);
}

// Function to broadcast stats updates
export async function broadcastStatsUpdate(stats: any) {
  const message = {
    type: 'stats-update', 
    data: stats,
    timestamp: new Date().toISOString(),
  };

  console.log(`[SSE] Broadcasting stats to ${clients.size} clients`);
  
  const clientsToRemove: string[] = [];
  
  for (const [clientId, client] of clients) {
    if (!sendEventToClient(client, message, 'stats-update')) {
      clientsToRemove.push(clientId);
    }
  }
  
  // Remove failed connections
  for (const clientId of clientsToRemove) {
    clients.delete(clientId);
    console.log(`[SSE] Removed inactive client ${clientId} during stats broadcast`);
  }
  
  console.log(`[SSE] Stats broadcast completed. Active clients: ${clients.size}`);
}

// Export the broadcast functions for use in other API routes
export { clients }; 