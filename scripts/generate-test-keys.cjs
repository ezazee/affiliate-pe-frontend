// Generate valid VAPID keys for testing
const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('🔐 Generated VAPID Keys:');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);

// Sample subscription with valid keys
const sampleSubscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/fake-endpoint-123",
  keys: {
    auth: vapidKeys.publicKey.substring(0, 24), // 16 bytes = 24 base64 chars
    p256dh: "BLc4xR7KqYh6B9W3pE2vT8nJ5mF1dG4aH7kL0sW9xY2zC5vN8qR3tU6iO0pS1wE4" // 65 bytes base64
  }
};

console.log('\n📱 Sample Subscription:');
console.log(JSON.stringify(sampleSubscription, null, 2));

// Test with curl command
console.log('\n🔧 Test Command:');
console.log(`curl -X POST http://localhost:3000/api/push/subscribe \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "x-user-email: adm.peskinproid@gmail.com" \\`);
console.log(`  -d '${JSON.stringify(sampleSubscription).replace(/"/g, '\\"')}'`);