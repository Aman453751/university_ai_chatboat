import API from './api';
import { showDesktopNotification } from './desktopNotifications';

export { showDesktopNotification };

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn("Service Worker / Push Manager is not supported by this browser.");
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (err) {
    console.error("Service Worker registration failed:", err);
    return null;
  }
}

export function getNotificationPermissionState() {
  if (!('Notification' in window)) {
    return 'not-supported';
  }
  return Notification.permission; // 'granted', 'denied', or 'default'
}

export function sendNativeDesktopNotification(title, body, url = '/dashboard') {
  return showDesktopNotification(title, body, url);
}

export async function subscribeUserToPush() {
  if (!('Notification' in window)) {
    throw new Error("Desktop notifications are not supported by your browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error("Notification permission was not granted by your browser. Please allow notifications in Chrome settings.");
  }

  let registration = null;
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    registration = await registerServiceWorker();
  }

  if (registration) {
    try {
      const keyRes = await API.get('/notifications/vapid-key');
      const vapidPublicKey = keyRes.data.public_key;
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });
      }

      await API.post('/notifications/subscribe', subscription);
    } catch (pushErr) {
      console.warn("VAPID Web Push subscription warning:", pushErr);
    }
  }

  // Test Notification Trigger
  showDesktopNotification(
    "🔔 University AI Assistant",
    "Desktop notifications are now enabled successfully!"
  );

  return true;
}

export async function unsubscribeUserFromPush() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        try {
          await API.post('/notifications/unsubscribe', { endpoint });
        } catch (e) {
          console.warn("Backend unsubscribe sync failed:", e);
        }
      }
    }
  } catch (e) {
    console.warn("Unsubscribe warning:", e);
  }
}
