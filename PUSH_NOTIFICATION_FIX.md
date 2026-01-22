# Fix untuk Push Notification di Android

## Langkah 1: Install Manual Service Worker
1. Buka aplikasi di Chrome Android
2. Buka Developer Options → Chrome → Inspect Device
3. Di console, jalankan:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered:', reg))
    .catch(err => console.error('SW failed:', err));
}
```

## Langkah 2: Clear Cache & Refresh
1. Chrome → Settings → Privacy → Clear browsing data
2. Pilih "Cached images and files"
3. Refresh aplikasi

## Langkah 3: Enable Notifications di Settings
1. Chrome → Settings → Site Settings → Notifications
2. Cari domain aplikasi Anda
3. Set ke "Allow"

## Langkah 4: Test Toggle
1. Login sebagai user
2. Buka Settings → Push Notifications
3. Toggle "Enable Push Notifications"
4. Accept browser permission prompt

## Alternative: Force Subscribe
Buka: http://your-domain.com/test-push
Klik "Enable Push Notifications" untuk manual subscribe

## Debug Commands:
```bash
# Check subscription status
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -H "x-user-email: your-email@example.com" \
  -d '{"title":"Test","body":"Debug message"}'
```