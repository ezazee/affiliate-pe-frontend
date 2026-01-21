// Push subscription debug script
// Paste ini di console browser user untuk debug

async function debugPushSubscription() {
  console.log('=== PUSH NOTIFICATION DEBUG ===');
  
  // 1. Check support
  const isSupported = 'serviceWorker' in navigator && 
                     'PushManager' in window && 
                     'Notification' in window;
  console.log('Push notifications supported:', isSupported);
  
  if (!isSupported) {
    console.error('Push notifications not supported');
    return;
  }
  
  // 2. Check permission
  const permission = Notification.permission;
  console.log('Notification permission:', permission);
  
  if (permission === 'denied') {
    console.error('User denied notification permission');
    console.log('User must enable notifications in browser settings');
    return;
  }
  
  // 3. Check service worker
  try {
    const registration = await navigator.serviceWorker.ready;
    console.log('Service worker ready:', registration.scope);
    
    // 4. Check current subscription
    const subscription = await registration.pushManager.getSubscription();
    console.log('Current subscription:', subscription);
    
    if (subscription) {
      console.log('Subscription details:', subscription.toJSON());
      return;
    }
    
    // 5. Try to subscribe
    if (permission === 'default') {
      console.log('Requesting permission...');
      const result = await Notification.requestPermission();
      console.log('Permission result:', result);
      
      if (result !== 'granted') {
        console.error('Permission not granted');
        return;
      }
    }
    
    // 6. Subscribe
    console.log('Subscribing to push notifications...');
    const vapidPublicKey = 'BILYQ98tlwWNaQr4pMx3D42k9gQ8raElNIhXU9OCTElnegaZF_sroUPocViXF2poTp6e3tktTMb5UgJdNbOm2MQ';
    
    function urlB64ToUint8Array(base64String) {
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
    
    const applicationServerKey = urlB64ToUint8Array(vapidPublicKey);
    
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer,
    });
    
    console.log('New subscription created:', newSubscription.toJSON());
    
    // 7. Send to server
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubscription.toJSON()),
    });
    
    const result = await response.json();
    console.log('Server response:', result);
    
  } catch (error) {
    console.error('Error during debug:', error);
  }
}

// Run debug
debugPushSubscription();