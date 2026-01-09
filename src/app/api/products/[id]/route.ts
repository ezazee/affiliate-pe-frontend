import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId
import { Product } from '@/types';

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const { id } = context.params;

    const client = await clientPromise;
    const db = client.db();

    const product = await db.collection<Product>('products').findOne({ _id: new ObjectId(id) });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Map _id to id for consistency with frontend
    const { id: originalId, ...rest } = product; // Remove the original 'id' field
    const formattedProduct = {
      ...rest,
      id: product._id.toString(), // Convert ObjectId to string
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
