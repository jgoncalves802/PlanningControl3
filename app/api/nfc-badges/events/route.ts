import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Store active connections
const clients = new Set<WritableStreamDefaultWriter>();

export async function GET(request: NextRequest) {
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Function to send data to client
      const sendEvent = (data: any, event = 'message') => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial connection confirmation
      sendEvent({ type: 'connected', timestamp: new Date().toISOString() }, 'connection');

      // Store this client connection
      const writer = controller as any;
      clients.add(writer);
      
      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clients.delete(writer);
        try {
          controller.close();
        } catch (e) {
          // Connection already closed
        }
      });

      // Send periodic heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          sendEvent({ type: 'heartbeat', timestamp: new Date().toISOString() }, 'heartbeat');
        } catch (e) {
          clearInterval(heartbeat);
          clients.delete(writer);
        }
      }, 30000); // 30 seconds heartbeat

      // Cleanup on close
      const cleanup = () => {
        clearInterval(heartbeat);
        clients.delete(writer);
      };

      // Add cleanup to controller
      (controller as any).cleanup = cleanup;
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

  const encoder = new TextEncoder();
  const eventMessage = `event: nfc-badge-update\ndata: ${JSON.stringify(message)}\n\n`;
  
  // Send to all connected clients
  for (const client of clients) {
    try {
      await client.write(encoder.encode(eventMessage));
    } catch (error) {
      // Remove failed connections
      clients.delete(client);
    }
  }
}

// Function to broadcast stats updates
export async function broadcastStatsUpdate(stats: any) {
  const message = {
    type: 'stats-update', 
    data: stats,
    timestamp: new Date().toISOString(),
  };

  const encoder = new TextEncoder();
  const eventMessage = `event: stats-update\ndata: ${JSON.stringify(message)}\n\n`;
  
  for (const client of clients) {
    try {
      await client.write(encoder.encode(eventMessage));
    } catch (error) {
      clients.delete(client);
    }
  }
}

// Export the broadcast functions for use in other API routes
export { clients }; 