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
    // Test basic connectivity
    const client = await connectToDatabase();
    const db = client.db();
    
    // Test if collections exist
    const collections = await db.listCollections().toArray();
    
    // Test users collection
    const usersCount = await db.collection('users').countDocuments();
    const sampleUsers = await db.collection('users').find({}).limit(3).toArray();
    
    // Test push subscription data
    const usersWithPush = await db.collection('users').find({
      pushSubscription: { $exists: true, $ne: null }
    }).toArray();

    await client.close();

    return NextResponse.json({
      success: true,
      mongodb: {
        connected: true,
        collections: collections.map(c => c.name),
        usersCount,
        sampleUsers: sampleUsers.map(u => ({
          email: u.email,
          hasPushSubscription: !!u.pushSubscription,
          notificationsEnabled: u.notificationsEnabled
        })),
        usersWithPushCount: usersWithPush.length,
        usersWithPushDetails: usersWithPush.map(u => ({
          email: u.email,
          endpoint: u.pushSubscription?.endpoint?.substring(0, 50) + '...',
          hasKeys: !!u.pushSubscription?.keys,
          notificationsEnabled: u.notificationsEnabled
        }))
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
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