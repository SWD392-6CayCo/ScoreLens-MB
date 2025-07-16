import { useEffect, useState } from 'react';
import { getFCMToken, onMessageListener } from '../config/firebase';
import { sendTokenToBackend } from '../services/fcmService';
import * as Notifications from 'expo-notifications';

export const useFCM = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    // 1. Request permission (Expo way)
    async function requestUserPermission() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        console.log('Notification permission granted');
        getFCMTokenAndSend();
      } else {
        console.log('Failed to get notification permission');
      }
    }

    // 2. Get FCM token
    async function getFCMTokenAndSend() {
      try {
        const token = await getFCMToken();
        if (token) {
          setFcmToken(token);
          // ⭐ Send to backend
          await sendTokenToBackend(token);
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    }

    requestUserPermission();

    // 3. Listen for messages
    onMessageListener()
      .then((payload: any) => {
        console.log('FCM Message received:', payload);
      })
      .catch((err) => console.log('Failed to receive message:', err));

  }, []);

  return { fcmToken };
};