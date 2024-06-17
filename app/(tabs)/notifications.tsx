import * as Notifications from 'expo-notifications';

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('You need to grant notification permissions to use this feature.');
  }
};

export const scheduleDailyNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Reminder",
      body: "Don't forget to scan your products!",
    },
    trigger: {
      hour: 9, // Set the hour for the notification (24-hour format)
      minute: 0, // Set the minute for the notification
      repeats: true,
    },
  });
};
