/**
 * WebSocket Client Service
 * Provides real-time updates from the backend
 */
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/components/ui/use-toast';

// Constants
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// Socket instance (singleton)
let socket: Socket | null = null;

/**
 * Initialize WebSocket connection
 */
export const initializeSocket = () => {
  if (!socket) {
    socket = io(WS_BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Setup global event handlers
    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('disconnect', (reason) => {
      console.log(`WebSocket disconnected: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  return socket;
};

/**
 * Get the socket instance
 */
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

/**
 * Disconnect WebSocket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Hook for subscribing to run updates
 * @param runId - The ID of the run to subscribe to
 */
export const useRunUpdates = (runId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!runId) return;

    const socket = getSocket();
    const channel = `run:${runId}`;

    // Handle connection status
    const handleConnect = () => {
      setIsConnected(true);
      // Subscribe to run updates
      socket.emit('subscribe', { channel });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Handle run updates
    const handleRunUpdate = (data: any) => {
      setLastUpdate(data);
      
      // Show toast notification for important status changes
      if (data.status && ['succeeded', 'failed', 'cancelled'].includes(data.status)) {
        toast({
          title: `Run ${data.status}`,
          description: `Run #${runId} ${data.status} at ${new Date().toLocaleTimeString()}`,
          variant: data.status === 'succeeded' ? 'default' : 'destructive',
        });
      }
    };

    // Setup event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(channel, handleRunUpdate);

    // Initial connection status
    setIsConnected(socket.connected);
    
    // If already connected, subscribe immediately
    if (socket.connected) {
      socket.emit('subscribe', { channel });
    }

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(channel, handleRunUpdate);
      socket.emit('unsubscribe', { channel });
    };
  }, [runId, toast]);

  return { isConnected, lastUpdate };
};

/**
 * Hook for subscribing to agent health updates
 * @param agentId - The ID of the agent to subscribe to
 */
export const useAgentHealthUpdates = (agentId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'degraded' | 'unhealthy' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!agentId) return;

    const socket = getSocket();
    const channel = `agent:${agentId}:health`;

    // Handle connection status
    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('subscribe', { channel });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Handle health updates
    const handleHealthUpdate = (data: { status: 'healthy' | 'degraded' | 'unhealthy' }) => {
      setHealthStatus(data.status);
      
      // Show toast for degraded or unhealthy status
      if (data.status !== 'healthy') {
        toast({
          title: `Agent Health Alert`,
          description: `Agent #${agentId} health status: ${data.status}`,
          variant: 'destructive',
        });
      }
    };

    // Setup event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(channel, handleHealthUpdate);

    // Initial connection status
    setIsConnected(socket.connected);
    
    // If already connected, subscribe immediately
    if (socket.connected) {
      socket.emit('subscribe', { channel });
    }

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(channel, handleHealthUpdate);
      socket.emit('unsubscribe', { channel });
    };
  }, [agentId, toast]);

  return { isConnected, healthStatus };
};

/**
 * Hook for subscribing to activity feed updates
 */
export const useActivityFeed = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const socket = getSocket();
    const channel = 'activity';

    // Handle connection status
    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('subscribe', { channel });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Handle activity updates
    const handleActivityUpdate = (data: any) => {
      setActivities((prev) => [data, ...prev].slice(0, 50)); // Keep last 50 activities
    };

    // Setup event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(channel, handleActivityUpdate);

    // Initial connection status
    setIsConnected(socket.connected);
    
    // If already connected, subscribe immediately
    if (socket.connected) {
      socket.emit('subscribe', { channel });
    }

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(channel, handleActivityUpdate);
      socket.emit('unsubscribe', { channel });
    };
  }, []);

  return { isConnected, activities };
};