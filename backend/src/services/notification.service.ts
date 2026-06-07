import { prisma } from '../utils/db.js';

export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any
): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true },
    });

    const settings = user?.settings as any;
    const pushToken = settings?.expoPushToken;

    if (!pushToken || !pushToken.startsWith('ExponentPushToken')) {
      console.log(`ℹ️ [PushService] User ${userId} does not have an Expo push token registered.`);
      return false;
    }

    // Call Expo Push endpoint via global fetch (built-in in Node 18+)
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept-encoding': 'gzip, deflate',
        'host': 'exp.host',
      },
      body: JSON.stringify({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      }),
    });

    const resData = await response.json();
    console.log(`📡 [PushService] Sent notification to user ${userId}. Response:`, resData);
    return response.ok;
  } catch (err) {
    console.error('❌ [PushService] Failed to send push notification:', err);
    return false;
  }
};
