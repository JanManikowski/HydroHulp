// notificationHelper.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Function to schedule a repeating notification every 10 seconds
export async function scheduleRepeatingNotification() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Reminder",
      body: 'This is your scheduled notification.',
    },
    trigger: {
      seconds: 10,
      repeats: true,
    },
  });
}
