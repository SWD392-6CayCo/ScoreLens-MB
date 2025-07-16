const API_BASE_URL = process.env.EXPO_PUBLIC_API_ENDPOINT;

export const sendTokenToBackend = async (token: string) => {
  try {
    const backendUrl = `${API_BASE_URL}/api/fcm/register-token`;
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // ⭐ Thêm thông tin device cho Spring Boot
      body: JSON.stringify({ 
        token: token,
        deviceType: 'mobile',
        timestamp: Date.now()
      }),
    });

    if (response.ok) {
      console.log('FCM token sent to backend successfully!');
      return true;
    } else {
      console.error('Failed to send FCM token:', response.status);
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      return false;
    }
  } catch (error) {
    console.error('Error sending FCM token to backend:', error);
    return false;
  }
};