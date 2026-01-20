import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const settings = await db.collection('settings').findOne({ name: 'notification_templates' });
    
    return NextResponse.json(settings?.value || {});
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const templates = await req.json();

    if (!templates) {
      return NextResponse.json({ error: 'Missing templates data' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    await db.collection('settings').updateOne(
      { name: 'notification_templates' },
      { $set: { name: 'notification_templates', value: templates, updatedAt: new Date() } },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true, message: 'Templates updated successfully' });
  } catch (error) {
    console.error('Error updating templates:', error);
    return NextResponse.json({ error: 'Failed to update templates' }, { status: 500 });
  }
}
