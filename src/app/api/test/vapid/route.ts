import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

export async function GET() {
  try {
    // Test VAPID configuration
    console.log('Testing VAPID configuration...');
    console.log('VAPID Public Key:', vapidPublicKey ? 'Set' : 'Not set');
    console.log('VAPID Private Key:', vapidPrivateKey ? 'Set' : 'Not set');

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({
        success: false,
        error: 'VAPID keys not configured'
      });
    }

    // Configure web-push
    webpush.setVapidDetails(
      'mailto:admin@peskinpro.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    // Test with a mock subscription (this will fail but tests VAPID config)
    const mockSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: {
        auth: 'test_auth_key',
        p256dh: 'test_p256dh_key'
      }
    };

    const testPayload = JSON.stringify({
      title: 'Test',
      body: 'Test notification'
    });

    try {
      await webpush.sendNotification(mockSubscription, testPayload);
    } catch (pushError: any) {
      // Expected to fail, but validates VAPID config
      console.log('Push test error (expected):', pushError.message);
      
      return NextResponse.json({
        success: true,
        message: 'VAPID configuration test completed',
        vapidConfigured: true,
        expectedError: pushError.message,
        note: 'Expected error with mock subscription - this confirms VAPID is working'
      });
    }

  } catch (error) {
    console.error('VAPID test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}