import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // Get all users and their subscription status
    const allUsers = await usersCollection.find({}).toArray();
    
    console.log('📊 Debug - All users:', allUsers.map(u => ({
      email: u.email,
      hasPushSubscription: !!u.pushSubscription,
      notificationsEnabled: u.notificationsEnabled,
      subscriptionEndpoint: u.pushSubscription?.endpoint?.substring(0, 50) + '...',
      subscriptionKeys: u.pushSubscription?.keys ? Object.keys(u.pushSubscription.keys) : [],
      lastUpdated: u.updatedAt
    })));
    
    const debugInfo = {
      totalUsers: allUsers.length,
      usersWithPushSubscription: allUsers.filter(u => u.pushSubscription).length,
      usersWithNotificationsEnabled: allUsers.filter(u => u.notificationsEnabled === true).length,
      usersDetails: allUsers.map(u => ({
        email: u.email,
        hasPushSubscription: !!u.pushSubscription,
        notificationsEnabled: u.notificationsEnabled,
        subscriptionEndpoint: u.pushSubscription?.endpoint?.substring(0, 50) + '...',
        subscriptionKeys: u.pushSubscription?.keys ? Object.keys(u.pushSubscription.keys) : [],
        lastUpdated: u.updatedAt
      }))
    };

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug info' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userAgent, permissionStatus } = await request.json();
    
    console.log('📱 Android Permission Debug:', {
      userAgent,
      permissionStatus,
      timestamp: new Date().toISOString(),
      origin: request.headers.get('origin')
    });

    // Log untuk debugging
    const debugInfo = {
      isAndroid: /Android/i.test(userAgent),
      isChrome: /Chrome/i.test(userAgent),
      permissionStatus,
      timestamp: new Date().toISOString(),
      recommendations: []
    };

    if (debugInfo.isAndroid) {
      debugInfo.recommendations.push('Use Chrome for Android');
      debugInfo.recommendations.push('Check Android Settings → Apps → Chrome → Permissions');
      debugInfo.recommendations.push('Restart Chrome after changing permissions');
    }

    // Save to database for analysis
    const client = await clientPromise;
    const db = client.db();
    await db.collection('debug_logs').insertOne({
      type: 'android_permission',
      ...debugInfo,
      userAgent,
      permissionStatus,
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: 'Android permission debug info logged'
    });

  } catch (error) {
    console.error('Android permission debug error:', error);
    return NextResponse.json(
      { error: 'Failed to log debug info' },
      { status: 500 }
    );
  }
}