import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Product } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const products = await db.collection<Product>('products').find({}).toArray();

    // Map _id to id for consistency with frontend
    const formattedProducts = products.map(product => {
      const { id, ...rest } = product; // Remove the original 'id' field
      return {
        ...rest,
        id: product._id.toString(), // Convert ObjectId to string
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
