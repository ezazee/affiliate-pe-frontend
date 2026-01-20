import { NextRequest, NextResponse } from 'next/server';
import { sendNotification, NotificationType } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext'; // Note: This is client side only, can't use here. 
// We should get userId from request or session. 
// For admin test, we might want to send to the current admin's ID (passed from client) or a specific ID.

export async function POST(req: NextRequest) {
  try {
    const { userId, type, data } = await req.json();

    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing userId or type' }, { status: 400 });
    }

    await sendNotification(userId, type as NotificationType, data || {});

    return NextResponse.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
