/**
 * Reusable Windows & Browser Native Desktop Notification Service.
 * Triggers a real operating-system toast popup outside the browser webpage.
 */
export function showDesktopNotification(title, message, url = '/dashboard') {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn("Desktop notifications are not supported in this browser environment.");
    return null;
  }

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body: message,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'abes-desktop-' + Date.now()
      });

      notification.onclick = function (event) {
        event.preventDefault();
        window.focus();
        if (url) {
          window.location.href = url;
        }
        notification.close();
      };

      // Also trigger via active Service Worker if available for OS Action Center persistence
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          if (reg && reg.showNotification) {
            reg.showNotification(title, {
              body: message,
              icon: '/logo.png',
              badge: '/logo.png',
              tag: 'abes-sw-' + Date.now(),
              data: { url }
            });
          }
        }).catch((e) => {
          console.debug("ServiceWorker showNotification skipped:", e);
        });
      }

      return notification;
    } catch (err) {
      console.error("Error creating native desktop notification:", err);
      return null;
    }
  } else {
    console.warn("Desktop notification skipped because permission is:", Notification.permission);
    return null;
  }
}
