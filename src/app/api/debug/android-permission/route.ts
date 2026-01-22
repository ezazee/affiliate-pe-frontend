import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userAgent, permissionStatus } = await request.json();
    
    console.log('📱 Android Debug Info:', {
      userAgent,
      permissionStatus,
      isAndroid: /Android/i.test(userAgent),
      isChrome: /Chrome/i.test(userAgent),
      timestamp: new Date()
    });

    // Check browser capabilities
    const capabilities = {
      serviceWorker: typeof ServiceWorker !== 'undefined',
      pushManager: typeof PushManager !== 'undefined', 
      notification: typeof Notification !== 'undefined',
      permissions: typeof navigator !== 'undefined' && 'permissions' in navigator
    };

    console.log('🔧 Browser Capabilities:', capabilities);

    return NextResponse.json({
      success: true,
      debug: {
        userAgent,
        isAndroid: /Android/i.test(userAgent),
        isChrome: /Chrome/i.test(userAgent),
        permissionStatus,
        capabilities,
        solutions: [
          "1. Chrome Settings → Site Settings → Notifications → Allow your domain",
          "2. Clear Chrome cache and restart browser",
          "3. Enable 'Background sync' in Chrome settings",
          "4. Check Android Settings → Apps → Chrome → Permissions",
          "5. Try in Incognito mode to test"
        ]
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}