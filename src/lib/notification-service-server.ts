import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import clientPromise from '@/lib/mongodb';

const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

// Configure web-push
webpush.setVapidDetails(
  'mailto:admin@peskinpro.com',
  vapidPublicKey,
  vapidPrivateKey
);

interface NotificationData {
  title: string;
  body: string;
  url: string;
  icon?: string;
  badge?: string;
}

interface NotificationTarget {
  role?: 'admin' | 'affiliator' | 'all';
  userId?: string;
  userEmail?: string;
}

export async function sendNotification(
  data: NotificationData,
  target?: NotificationTarget
): Promise<{ success: boolean; sent: number; failed: number; message: string }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // Build query based on target
    let query: any = {
      pushSubscription: { $exists: true, $ne: null },
      $or: [
        { notificationsEnabled: true },
        { notificationsEnabled: { $exists: false } },
        { notificationsEnabled: null }
      ]
    };

    if (target) {
      if (target.role === 'admin') {
        query.role = 'admin';
      } else if (target.role === 'affiliator') {
        query.role = { $in: ['affiliator', 'affiliate'] };
      } else if (target.userEmail) {
        query.email = target.userEmail;
      } else if (target.userId) {
        query._id = target.userId;
      }
    }

    const users = await usersCollection.find(query).toArray();
    console.log(`📱 Found ${users.length} users for notification:`, data.title);

    if (users.length === 0) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        message: 'No users with push subscriptions found'
      };
    }

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      url: data.url,
      icon: data.icon || '/favicon/android-chrome-192x192.png',
      badge: data.badge || '/favicon/favicon-32x32.png',
    });

    const sendPromises = users.map(async (user) => {
      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        return { success: true, userId: user.email };
      } catch (error: any) {
        console.error(`❌ Failed to send to ${user.email}:`, error.message);
        
        // Remove invalid subscription
        if (error.statusCode === 410 || error.statusCode === 404) {
          await usersCollection.updateOne(
            { email: user.email },
            {
              $unset: { pushSubscription: '' },
              $set: { notificationsEnabled: false },
            }
          );
        }
        
        return { success: false, userId: user.email, error: error.message };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    
    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length;
    
    const failed = results.length - successful;

    return {
      success: successful > 0,
      sent: successful,
      failed,
      message: `Notification sent to ${successful} users`
    };

  } catch (error) {
    console.error('❌ Notification service error:', error);
    return {
      success: false,
      sent: 0,
      failed: 0,
      message: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Admin Notifications
export const adminNotifications = {
  newAffiliator: (affiliatorName: string, affiliatorEmail: string) =>
    sendNotification({
      title: '👋 Affiliator Baru Mendaftar!',
      body: `${affiliatorName} (${affiliatorEmail}) baru saja mendaftar sebagai affiliator.`,
      url: '/admin/affiliators'
    }, { role: 'admin' }),

  newOrder: (orderNumber: string, customerName: string, total: string) =>
    sendNotification({
      title: '🛒 Pesanan Baru!',
      body: `Pesanan #${orderNumber} dari ${customerName} dengan total ${total}`,
      url: '/admin/orders'
    }, { role: 'admin' }),

  withdrawalRequest: (affiliateName: string, amount: string) =>
    sendNotification({
      title: '💰 Permohonan Penarikan Dana',
      body: `${affiliateName} mengajukan penarikan sebesar ${amount}`,
      url: '/admin/withdrawals'
    }, { role: 'admin' }),
};

// Affiliator Notifications
export const affiliatorNotifications = {
  newOrder: (orderNumber: string, customerName: string, commission: string, targetUserEmail?: string) =>
    sendNotification({
      title: '🛒 Pesanan Baru!',
      body: `Pesanan #${orderNumber} dari ${customerName}. Komisi: ${commission}`,
      url: '/affiliator/commissions'
    }, { userEmail: targetUserEmail }),

  orderShipped: (orderNumber: string, customerName: string, targetUserEmail?: string) =>
    sendNotification({
      title: '📦 Pesanan Dikirim',
      body: `Pesanan #${orderNumber} untuk ${customerName} telah dikirim`,
      url: '/affiliator/commissions'
    }, { userEmail: targetUserEmail }),

  orderCompleted: (orderNumber: string, customerName: string, targetUserEmail?: string) =>
    sendNotification({
      title: '✅ Pesanan Selesai',
      body: `Pesanan #${orderNumber} untuk ${customerName} telah selesai. Komisi telah ditambahkan!`,
      url: '/affiliator/commissions'
    }, { userEmail: targetUserEmail }),

  commissionEarned: (amount: string, orderNumber: string, targetUserEmail?: string) =>
    sendNotification({
      title: '💵 Pemasukan Komisi!',
      body: `Komisi sebesar ${amount} dari pesanan #${orderNumber} telah ditambahkan ke akun Anda`,
      url: '/affiliator/commissions'
    }, { userEmail: targetUserEmail }),

  balanceUpdated: (availableBalance: string, targetUserEmail?: string) =>
    sendNotification({
      title: '💰 Saldo Dapat Ditarik Diperbarui',
      body: `Saldo yang dapat ditarik: ${availableBalance}`,
      url: '/affiliator'
    }, { userEmail: targetUserEmail }),

  withdrawalApproved: (amount: string, processedAt: string, targetUserEmail?: string) =>
    sendNotification({
      title: '✅ Penarikan Disetujui',
      body: `Penarikan sebesar ${amount} telah disetujui pada ${processedAt}`,
      url: '/affiliator'
    }, { userEmail: targetUserEmail }),

  withdrawalRejected: (amount: string, reason: string, targetUserEmail?: string) =>
    sendNotification({
      title: '❌ Penarikan Ditolak',
      body: `Penarikan sebesar ${amount} ditolak. Alasan: ${reason}`,
      url: '/affiliator'
    }, { userEmail: targetUserEmail }),
};