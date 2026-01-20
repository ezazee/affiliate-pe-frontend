import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { subscription, userId } = await req.json();

    if (!subscription || !userId) {
      return NextResponse.json({ error: 'Missing subscription or userId' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Store subscription
    // Use upsert to avoid duplicates for the same endpoint
    await db.collection('subscriptions').updateOne(
        { 'subscription.endpoint': subscription.endpoint },
        { 
            $set: { 
                userId,
                subscription, 
                updatedAt: new Date() 
            } 
        },
        { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
