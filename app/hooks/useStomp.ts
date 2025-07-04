// hooks/useStomp.ts
import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

const WS_URL = process.env.EXPO_PUBLIC_SOCKET_ENDPOINT;

export const useStomp = () => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 3000,
      debug: (str) => console.log('[STOMP]', str),
      onConnect: () => {
        console.log('%cConnected to STOMP', 'color: green');
        setIsConnected(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.log('%cDisconnected from STOMP', 'color: red');
      },
      onStompError: (frame) => {
        console.error('[STOMP ERROR]', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  return { client: clientRef.current, isConnected };
};
