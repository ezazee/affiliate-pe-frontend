import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const PUBLIC_VAPID_KEY = 'BPCvkIo9U5A5g0TIVZLwKKdn5OrycBTaOwLsyCYUXngspMOVBXqqpGeCb5Vn4g_f4YuzlOQB2kRUnVdv1LBy134';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // run only in browser
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg);
        reg.pushManager.getSubscription().then(sub => {
          if (sub && !(sub.expirationTime && Date.now() > sub.expirationTime)) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
      });
    }
  }, []);

  const subscribeToNotifications = async () => {
    try {
      if (!registration) {
        console.error('Service Worker not ready');
        return;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });

      setSubscription(sub);
      setIsSubscribed(true);

      // Send to server
      if (user) {
        await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subscription: sub,
                userId: user.id
            })
        });
      }

      console.log('Web Push Subscribed!');
    } catch (error) {
      console.error('Failed to subscribe to Push', error);
    }
  };

  return {
    isSubscribed,
    subscribeToNotifications,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'default'
  };
}
