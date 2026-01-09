import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Commission } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const affiliatorId = searchParams.get('affiliatorId');

  if (!affiliatorId) {
    return NextResponse.json({ error: 'affiliatorId is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const userCommissions = await db.collection<Commission>('commissions').find({ affiliatorId }).toArray();
    // Map _id to id for consistency with frontend
    const formattedCommissions = userCommissions.map(commission => {
      const { id, ...rest } = commission; // Remove the original 'id' field
      return {
        ...rest,
        id: commission._id.toString(), // Convert ObjectId to string
      };
    });

    return NextResponse.json(formattedCommissions);
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
