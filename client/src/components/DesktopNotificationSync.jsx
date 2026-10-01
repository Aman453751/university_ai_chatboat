import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { showDesktopNotification } from '../services/desktopNotifications';

export default function DesktopNotificationSync() {
  const { user } = useAuth();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const syncNotifications = async () => {
      try {
        const res = await API.get('/notifications');
        const notifData = res.data;
        const notifications = Array.isArray(notifData) ? notifData : (notifData.notifications || []);

        const seenRaw = localStorage.getItem('seen_desktop_notif_ids');
        let seenIds = seenRaw ? JSON.parse(seenRaw) : [];

        if (!initializedRef.current) {
          initializedRef.current = true;
          notifications.forEach(n => {
            if (!seenIds.includes(n.id)) seenIds.push(n.id);
          });
          localStorage.setItem('seen_desktop_notif_ids', JSON.stringify(seenIds));
          return;
        }

        notifications.forEach(n => {
          if (!seenIds.includes(n.id)) {
            seenIds.push(n.id);
            localStorage.setItem('seen_desktop_notif_ids', JSON.stringify(seenIds));
            showDesktopNotification(n.title, n.message, n.link || '/dashboard');
          }
        });
      } catch (err) {
        console.debug("Desktop Notification sync error:", err);
      }
    };

    syncNotifications();
    const interval = setInterval(syncNotifications, 5000);

    return () => clearInterval(interval);
  }, [user]);

  return null;
}
