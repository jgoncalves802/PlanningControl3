'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNFCBadgeSSE } from '@/lib/hooks/useSSEConnection';

export default function SSEDebugPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [clientId, setClientId] = useState<string>('');
  
  const { isConnected, eventSource } = useNFCBadgeSSE();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    addLog(`SSE Connection: ${isConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
  }, [isConnected]);

  useEffect(() => {
    if (!eventSource) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        addLog(`Message received: ${data.type} - ${JSON.stringify(data)}`);
        setTestResults(prev => [{ event: 'message', data, timestamp: Date.now() }, ...prev.slice(0, 9)]);
        
        // Capture client ID from connection event
        if (data.type === 'connected' && data.clientId) {
          setClientId(data.clientId);
          addLog(`Client ID assigned: ${data.clientId}`);
        }
      } catch (error) {
        addLog(`Error parsing message: ${error}`);
      }
    };

    const handleError = (event: Event) => {
      addLog(`SSE Error: ${event}`);
    };

    const handleOpen = (event: Event) => {
      addLog(`SSE Opened: Connection established`);
    };

    eventSource.addEventListener('message', handleMessage);
    eventSource.addEventListener('nfc-badge-update', handleMessage);
    eventSource.addEventListener('stats-update', handleMessage);
    eventSource.addEventListener('heartbeat', handleMessage);
    eventSource.addEventListener('connection', handleMessage);
    eventSource.addEventListener('error', handleError);
    eventSource.addEventListener('open', handleOpen);

    return () => {
      eventSource.removeEventListener('message', handleMessage);
      eventSource.removeEventListener('nfc-badge-update', handleMessage);
      eventSource.removeEventListener('stats-update', handleMessage);
      eventSource.removeEventListener('heartbeat', handleMessage);
      eventSource.removeEventListener('connection', handleMessage);
      eventSource.removeEventListener('error', handleError);
      eventSource.removeEventListener('open', handleOpen);
    };
  }, [eventSource]);

  const handleTestBroadcast = async () => {
    try {
      addLog('Sending test broadcast...');
      const response = await fetch('/api/nfc-badges/events/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      addLog(`Test broadcast result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Test broadcast failed: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults([]);
  };

  return (
    <Card className="p-4 mb-4 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🔍 SSE Debug Panel</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {clientId && (
            <div className="text-xs text-gray-600 font-mono">
              ID: {clientId}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleTestBroadcast} size="sm">
            🧪 Test Broadcast
          </Button>
          <Button onClick={clearLogs} variant="outline" size="sm">
            🗑️ Clear Logs
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">📝 Event Logs</h4>
            <div className="bg-gray-100 p-3 rounded max-h-60 overflow-y-auto text-xs font-mono">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">📦 Received Events</h4>
            <div className="bg-gray-100 p-3 rounded max-h-60 overflow-y-auto text-xs">
              {testResults.length === 0 ? (
                <div className="text-gray-500">No events received...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded">
                    <div className="font-medium">{result.data.type || 'message'}</div>
                    <div className="text-gray-600">{JSON.stringify(result.data, null, 2)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-600">
          <p><strong>Como usar:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Verifique se o status mostra "Connected"</li>
            <li>Clique em "Test Broadcast" para enviar um evento de teste</li>
            <li>Faça operações em crachás em outros dispositivos</li>
            <li>Verifique se os eventos aparecem aqui em tempo real</li>
          </ul>
        </div>
      </div>
    </Card>
  );
} 
