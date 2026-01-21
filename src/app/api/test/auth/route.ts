import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Test authentication
    const userInfo = await getUserFromRequest(request);
    
    console.log('🔍 Test Auth - Headers:', Object.fromEntries(request.headers.entries()));
    console.log('👤 Test Auth - User Info:', userInfo);

    // Test database connection
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');
    
    const allUsers = await usersCollection.find({}).toArray();
    
    return NextResponse.json({
      success: true,
      auth: {
        userInfo,
        hasUser: !!userInfo,
        userEmail: userInfo?.email || 'No user found'
      },
      database: {
        connected: true,
        totalUsers: allUsers.length,
        users: allUsers.map(u => ({
          email: u.email,
          hasPushSubscription: !!u.pushSubscription,
          notificationsEnabled: u.notificationsEnabled
        }))
      }
    });

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Test direct database update
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    const testSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-' + Date.now(),
      keys: {
        p256dh: 'test-key-' + Date.now(),
        auth: 'test-auth-' + Date.now()
      }
    };

    const result = await usersCollection.updateOne(
      { email },
      {
        $set: {
          pushSubscription: testSubscription,
          notificationsEnabled: true,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Test subscription added',
      email,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      testSubscription
    });

  } catch (error) {
    console.error('Test update error:', error);
    return NextResponse.json(
      { error: 'Update failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}