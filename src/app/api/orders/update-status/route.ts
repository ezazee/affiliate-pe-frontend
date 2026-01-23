import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { affiliatorNotifications } from '@/lib/notification-service-server';
import { webNotificationService } from '@/lib/web-notification-service';

export async function POST(req: NextRequest) {
  try {
    const { orderNumber, status, affiliateEmail } = await req.json();

    if (!orderNumber || !status) {
      return NextResponse.json({ error: 'Missing orderNumber or status' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get order details
    const order = await db.collection('orders').findOne({ orderNumber });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };

    // Add timestamps based on status
    if (status === 'shipped') {
      updateData.shippedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await db.collection('orders').updateOne(
      { orderNumber },
      { $set: updateData }
    );

    // Send notifications
    try {
      const targetEmail = affiliateEmail || (await db.collection('users').findOne({ _id: new ObjectId(order.affiliatorId) }))?.email;

      if (targetEmail) {
        if (status === 'shipped') {
          await affiliatorNotifications.orderShipped(
            orderNumber,
            order.buyerName,
            targetEmail
          );

          // Add web notification
          await webNotificationService.notifyOrderShipped(
            orderNumber,
            order.buyerName,
            targetEmail
          );

        } else if (status === 'completed') {
          await affiliatorNotifications.orderCompleted(
            orderNumber,
            order.buyerName,
            targetEmail
          );

          const commissionRate = 0.1; // 10% commission
          const commissionAmount = Math.round(order.productPrice * commissionRate);
          
          await affiliatorNotifications.commissionEarned(
            `Rp ${commissionAmount.toLocaleString('id-ID')}`,
            orderNumber,
            targetEmail
          );

          // Add web notifications
          await webNotificationService.notifyOrderCompleted(
            orderNumber,
            order.buyerName,
            targetEmail
          );

          await webNotificationService.notifyCommissionEarned(
            `Rp ${commissionAmount.toLocaleString('id-ID')}`,
            orderNumber,
            targetEmail
          );

          // Update commission in database
          await db.collection('commissions').insertOne({
            orderNumber,
            affiliatorId: order.affiliatorId,
            productId: order.productId,
            productPrice: order.productPrice,
            commissionRate,
            commissionAmount,
            status: 'completed',
            createdAt: new Date(),
            completedAt: new Date()
          });
        }
      }

      console.log(`✅ All notifications sent for order status update: ${orderNumber} -> ${status}`);
    } catch (notificationError) {
      console.error('❌ Failed to send notifications for order update:', notificationError);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order ${orderNumber} status updated to ${status}` 
    });

  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}