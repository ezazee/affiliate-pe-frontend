import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const userToInsert: Omit<User, '_id' | 'id'> = {
      name,
      email,
      password,
      role: 'affiliator',
      status: 'pending',
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(userToInsert);

    const createdUser: User = { ...userToInsert, _id: result.insertedId, id: result.insertedId.toString() };

    return NextResponse.json({ user: createdUser });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
