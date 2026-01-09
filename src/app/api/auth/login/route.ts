import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { User } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection<User>('users').findOne({ email, password });

    if (user) {
      const userWithPassword = user as Required<User>;
      const { password: _, ...userWithoutPassword } = userWithPassword;
      return NextResponse.json({ user: userWithoutPassword });
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
