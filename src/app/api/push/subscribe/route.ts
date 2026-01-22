import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth-utils';

const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

// Configure web-push
webpush.setVapidDetails(
  'mailto:admin@peskinpro.com',
  vapidPublicKey,
  vapidPrivateKey
);

// MongoDB connection
async function connectToDatabase() {
  const client = await clientPromise;
  return client;
}

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    if (!subscription.endpoint || !subscription.keys || !subscription.keys.auth || !subscription.keys.p256dh) {
      console.error('❌ Invalid subscription data received:', subscription);
      return NextResponse.json(
        { error: 'Invalid subscription data. Missing required fields.', details: subscription },
        { status: 400 }
      );
    }

    // Get user from request
    const userInfo = await getUserFromRequest(request);
    if (!userInfo) {
      console.error('❌ No user found in subscription request');
      console.error('📝 Headers:', Object.fromEntries(request.headers.entries()));
      return NextResponse.json(
        { error: 'Authentication required', debug: 'No user found in request' },
        { status: 401 }
      );
    }

    console.log('👤 User found:', userInfo);

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection('users');

    // Update user with push subscription
    const result = await usersCollection.updateOne(
      { email: userInfo.email }, // Use email as identifier
      {
        $set: {
          pushSubscription: subscription,
          notificationsEnabled: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log('💾 Subscription saved to database:', {
      email: userInfo.email,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      subscriptionEndpoint: subscription.endpoint?.substring(0, 50) + '...'
    });

    // Skip test notification for faster response

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to push notifications',
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to notifications' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    // Get user from request
    const userInfo = await getUserFromRequest(request);
    if (!userInfo) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection('users');

    // Remove push subscription
    await usersCollection.updateOne(
      { email: userInfo.email }, // Use email as identifier
      {
        $unset: {
          pushSubscription: '',
        },
        $set: {
          notificationsEnabled: false,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications',
    });

  } catch (error) {
    console.error('Unsubscription error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from notifications' },
      { status: 500 }
    );
  }
}