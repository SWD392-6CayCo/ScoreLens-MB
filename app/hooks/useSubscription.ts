// hooks/useSubscription.ts
import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';

type MessageCallback = (message: any) => void;

export const useSubscription = (
  client: Client | null,
  isConnected: boolean,
  destination: string,
  callback: MessageCallback
) => {
  useEffect(() => {
    if (client && isConnected) {
      const subscription = client.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (e) {
          callback(message.body);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [client, isConnected, destination, callback]);
};
