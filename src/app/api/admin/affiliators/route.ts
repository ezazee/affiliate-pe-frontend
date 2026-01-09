import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { User } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const affiliators = await db.collection<User>('users').find({ role: 'affiliator' }).toArray();

    // Map _id to id for consistency with frontend
    const formattedAffiliators = affiliators.map(affiliator => {
      const { id, ...rest } = affiliator; // Remove the original 'id' field
      return {
        ...rest,
        id: affiliator._id.toString(), // Convert ObjectId to string
      };
    });

    return NextResponse.json(formattedAffiliators);
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
