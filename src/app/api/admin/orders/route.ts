import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Order } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const orders = await db.collection<Order>('orders').find({}).toArray();

    // Map _id to id for consistency with frontend
    const formattedOrders = orders.map(order => {
      const { id, ...rest } = order; // Remove the original 'id' field
      return {
        ...rest,
        id: order._id.toString(), // Convert ObjectId to string
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
