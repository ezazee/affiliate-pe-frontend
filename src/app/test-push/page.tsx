import { NextRequest, NextResponse } from 'next/server';

// Simple browser subscription simulator
export async function GET() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Push Notification Test</title>
</head>
<body>
    <h1>Push Notification Test</h1>
    <button id="subscribeBtn">Enable Push Notifications</button>
    <div id="result"></div>
    
    <script>
        let swRegistration = null;
        
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    swRegistration = registration;
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => console.error('SW registration failed:', error));
        }
        
        // Subscribe function
        async function subscribeToPush() {
            try {
                // Request permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Permission denied');
                }
                
                // Subscribe to push
                const subscription = await swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlB64ToUint8Array('BEDiXZ34k42Cp1Vd_AfbmpcUAnq5ZEdj8x-DbNilC6A6Khldz9LlLQFklsbVpXrWslG6qRrIEsEnLy-vlUtKi-w')
                });
                
                console.log('Subscription created:', subscription);
                
                // Save to server
                const response = await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-email': 'adm.peskinproid@gmail.com'
                    },
                    body: JSON.stringify(subscription.toJSON())
                });
                
                const result = await response.json();
                console.log('Server response:', result);
                
                document.getElementById('result').innerHTML = 
                    '<h3>Subscription Success!</h3><pre>' + JSON.stringify(result, null, 2) + '</pre>';
                
            } catch (error) {
                console.error('Subscription failed:', error);
                document.getElementById('result').innerHTML = 
                    '<h3>Subscription Failed!</h3><p>' + error.message + '</p>';
            }
        }
        
        // Helper function
        function urlB64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }
        
        document.getElementById('subscribeBtn').addEventListener('click', subscribeToPush);
    </script>
</body>
</html>`;
    
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}