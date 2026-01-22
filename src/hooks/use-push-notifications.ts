import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const userAgent = navigator.userAgent;
      const isAndroid = /Android/i.test(userAgent);
      const isChrome = /Chrome/i.test(userAgent);
      
      console.log('📱 Device info:', { userAgent, isAndroid, isChrome });
      
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      
      console.log('🔧 Feature support:', {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notification: 'Notification' in window
      });
      
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      } else {
        if (isAndroid && !isChrome) {
          console.warn('⚠️ Push notifications require Chrome on Android');
        }
      }
    };

    checkSupport();
  }, []);

  // Check current subscription status - SIMPLE
  useEffect(() => {
    if (!isSupported) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        
        if (sub) {
          setSubscription(sub.toJSON() as PushSubscription);
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        setIsSubscribed(false);
      }
    };

    checkSubscription();
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (err) {
      console.error('Error requesting permission:', err);
      setError('Failed to request notification permission');
      return 'denied';
    }
  }, [isSupported]);

  // Subscribe to push notifications - SIMPLE & FAST
  const subscribe = useCallback(async (retryCount = 0) => {
    if (!isSupported) {
      setError('Push notifications not supported');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simple permission check
      const currentPermission = Notification.permission === 'granted' ? 'granted' : 
                               await Notification.requestPermission();
      
      if (currentPermission !== 'granted') {
        setError('Permission denied. Please allow notifications.');
        setIsLoading(false);
        return;
      }

      // Get service worker
      const registration = await navigator.serviceWorker.ready;
      
      // Check existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        // Update existing
        const subscriptionData = existingSubscription.toJSON() as PushSubscription;
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user?.email || '',
          },
          body: JSON.stringify(subscriptionData),
        });

        if (response.ok) {
          setSubscription(subscriptionData);
          setIsSubscribed(true);
          setIsLoading(false);
          return;
        }
      }
      
      // Create new subscription
      const vapidKey = 'BEDiXZ34k42Cp1Vd_AfbmpcUAnq5ZEdj8x-DbNilC6A6Khldz9LlLQFklsbVpXrWslG6qRrIEsEnLy-vlUtKi-w';
      const applicationServerKey = urlB64ToUint8Array(vapidKey);
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });
      
      const subscriptionData = pushSubscription.toJSON() as PushSubscription;
      
      // Save to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      setSubscription(subscriptionData);
      setIsSubscribed(true);
      setPermission(currentPermission);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Subscription failed';
      setError(errorMessage);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported || !isSubscribed) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();

      if (pushSubscription) {
        // Remove from server first
        if (subscription) {
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': user?.email || '',
            },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
            }),
          });
        }

        // Remove from browser
        await pushSubscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      setError('Failed to unsubscribe from push notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isSubscribed, subscription]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
  };
};

// Helper function to convert base64 string to Uint8Array
function urlB64ToUint8Array(base64String: string): Uint8Array {
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

// Helper function to validate subscription format
function validateSubscription(subscription: any): boolean {
  if (!subscription.endpoint || !subscription.keys) {
    console.error('❌ Invalid subscription: missing endpoint or keys');
    return false;
  }
  
  if (!subscription.keys.auth || !subscription.keys.p256dh) {
    console.error('❌ Invalid subscription: missing auth or p256dh keys');
    return false;
  }
  
  console.log('✅ Subscription format valid');
  return true;
}