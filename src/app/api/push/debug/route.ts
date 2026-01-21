import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const mongodbUri = process.env.MONGODB_URI!;

// MongoDB connection
async function connectToDatabase() {
  const client = new MongoClient(mongodbUri);
  await client.connect();
  return client;
}

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection('users');

    // Get all users and their subscription status
    const allUsers = await usersCollection.find({}).toArray();
    
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

    await client.close();

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