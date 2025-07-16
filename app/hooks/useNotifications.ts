import { useEffect, useState } from 'react';
import { NotificationService } from '../services/notificationService';
import * as Notifications from 'expo-notifications';

// ⭐ Thêm interface cho match notifications
export interface MatchNotification {
  title: string;
  body: string;
  matchData?: any;
  timestamp: number;
}

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  // ⭐ Thêm FCM token state
  const [fcmToken, setFcmToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<any>(null);
  // ⭐ Thêm match notifications state
  const [matchNotifications, setMatchNotifications] = useState<MatchNotification[]>([]);
  // ⭐ Thêm connection state
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeNotifications() {
      try {
        // ⭐ Setup FCM flow (thay thế code cũ)
        const result = await NotificationService.setupFCMFlow();
        
        if (result.success && result.fcmToken) {
          setFcmToken(result.fcmToken);
          setExpoPushToken(result.expoPushToken ?? undefined);
          setIsConnected(true);
          setError(null);
          
          // ⭐ Setup FCM listener để nhận message từ Spring Boot
          NotificationService.setupFCMListener((payload) => {
            const matchNotification: MatchNotification = {
              title: payload.notification?.title || 'Match Update',
              body: payload.notification?.body || '',
              matchData: payload.data, // ⭐ Data từ Spring Boot
              timestamp: Date.now()
            };
            
            setMatchNotifications(prev => [matchNotification, ...prev]);
            setNotification(payload); // Keep existing functionality
            
            console.log('📱 Match data from Spring Boot:', matchNotification.matchData);
          });
          
        } else {
          setError('Failed to setup FCM connection');
          setIsConnected(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsConnected(false);
      }
    }

    // ⭐ Thay thế code cũ bằng function mới
    initializeNotifications();

    // Keep existing Expo notification listeners
    const notificationListener = NotificationService.addNotificationReceivedListener(
      notification => {
        console.log('Expo Notification received:', notification);
        setNotification(notification);
      }
    );

    const responseListener = NotificationService.addNotificationResponseReceivedListener(
      response => {
        console.log('Notification response:', response);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const sendTestNotification = async () => {
    await NotificationService.sendLocalNotification(
      'Test Notification',
      'This is a test message!',
      { test: true }
    );
  };

  return {
    expoPushToken,
    // ⭐ Thêm FCM data vào return
    fcmToken,
    isConnected,
    error,
    matchNotifications,
    notification,
    sendTestNotification,
    // ⭐ Helper để clear notifications
    clearMatchNotifications: () => setMatchNotifications([])
  };
};