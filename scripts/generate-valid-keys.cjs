const crypto = require('crypto');

// Generate proper 65-byte p256dh key
function generateValidP256dh() {
  // Generate 65 bytes (65 * 8 = 520 bits)
  const keyBytes = crypto.randomBytes(65);
  return keyBytes.toString('base64');
}

// Generate proper 16-byte auth key
function generateValidAuth() {
  const keyBytes = crypto.randomBytes(16);
  return keyBytes.toString('base64');
}

const sampleSubscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/fake-endpoint-123",
  keys: {
    auth: generateValidAuth(), // 24 chars = 16 bytes
    p256dh: generateValidP256dh() // 88 chars = 65 bytes (with padding)
  }
};

console.log('📱 Valid Sample Subscription:');
console.log(JSON.stringify(sampleSubscription, null, 2));

// Test command
console.log('\n🔧 Test Command:');
console.log(`curl -X POST http://localhost:3000/api/push/subscribe \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "x-user-email: adm.peskinproid@gmail.com" \\`);
console.log(`  -d '${JSON.stringify(sampleSubscription).replace(/"/g, '\\"')}'`);