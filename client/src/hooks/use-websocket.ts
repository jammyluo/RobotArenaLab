import { useEffect, useRef } from 'react';
import { wsManager } from '@/lib/websocket';

export function useWebSocket() {
  const isConnected = useRef(false);

  useEffect(() => {
    if (!isConnected.current) {
      wsManager.connect();
      isConnected.current = true;
    }

    return () => {
      // Don't disconnect on unmount as other components might be using it
    };
  }, []);

  return {
    send: wsManager.send.bind(wsManager),
    subscribe: wsManager.subscribe.bind(wsManager)
  };
}
