import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const messaging = getMessaging(app);

// ⭐ Sửa getFCMToken - bỏ VAPID key
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log('FCM not supported on this platform');
      return null;
    }

    // ⭐ Bỏ vapidKey - không cần cho Spring Boot flow
    const currentToken = await getToken(messaging);
    
    if (currentToken) {
      console.log('FCM Registration Token:', currentToken);
      return currentToken;
    } else {
      console.log('No FCM registration token available.');
      return null;
    }
  } catch (err) {
    console.error('Error getting FCM token:', err);
    return null;
  }
};

// ⭐ Lắng nghe messages từ Spring Boot
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('FCM Message from Spring Boot:', payload);
      resolve(payload);
    });
  });