import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
// ⭐ Thêm import FCM functions
import { getFCMToken, onMessageListener } from '../config/firebase';
import { sendTokenToBackend } from './fcmService';

// Cấu hình cách hiển thị notification
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  
  // ⭐ Thêm method setup FCM complete flow
  static async setupFCMFlow(): Promise<{
    success: boolean;
    fcmToken: string | null;
    expoPushToken: string | null;
  }> {
    try {
      // 1. Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ Notification permission denied');
        return { success: false, fcmToken: null, expoPushToken: null };
      }

      // 2. Get FCM token (for Spring Boot)
      const fcmToken = await getFCMToken();
      
      // 3. Get Expo push token (existing functionality)
      const expoPushToken = await this.registerForPushNotifications();

      // 4. Send FCM token to Spring Boot
      if (fcmToken) {
        const sent = await sendTokenToBackend(fcmToken);
        if (sent) {
          console.log('✅ FCM token sent to Spring Boot successfully');
          return { success: true, fcmToken: fcmToken ?? null, expoPushToken: expoPushToken ?? null };
        }
      }

      return { success: false, fcmToken: fcmToken ?? null, expoPushToken: expoPushToken ?? null };
    } catch (error) {
      console.error('Error in FCM setup flow:', error);
      return { success: false, fcmToken: null, expoPushToken: null };
    }
  }

  // ⭐ Thêm FCM message listener
  static setupFCMListener(onMessageReceived: (payload: any) => void) {
    onMessageListener()
      .then((payload: any) => {
        console.log('🔔 FCM Message from Spring Boot:', payload);
        onMessageReceived(payload);
      })
      .catch((err) => console.log('FCM listener error:', err));
  }

  // Existing method - không thay đổi
  static async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId,
      });
      
      console.log('Push Token:', token.data);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token?.data;
  }

  // Existing methods - không thay đổi
  static addNotificationReceivedListener(callback: (notification: any) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  static addNotificationResponseReceivedListener(callback: (response: any) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  static async sendLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null,
    });
  }
}