import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { NotificationConfig, buildNotification, getTemplateById } from '@/lib/notification-templates';

export async function POST(request: NextRequest) {
  try {
    const { templateId, variables, targetUserId, targetRole, title, body, url }: Partial<NotificationConfig> = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const template = getTemplateById(templateId as any);
    if (!template) {
      return NextResponse.json(
        { error: `Template not found: ${templateId}` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');
    const settingsCollection = db.collection('settings');

    // Get custom templates from database
    const customTemplates = await settingsCollection.findOne({ key: 'notificationTemplates' });
    const customTemplate = customTemplates?.templates?.find((t: any) => 
      t.templateId === templateId && t.enabled
    );

    // Check if template is disabled
    if (customTemplate && customTemplate.enabled === false) {
      return NextResponse.json({
        success: true,
        message: 'Template is disabled',
        sent: 0,
        templateId,
        disabled: true
      });
    }

    // Build query for target users
    let query: any = { 
      pushSubscription: { $exists: true, $ne: null },
      notificationsEnabled: true 
    };

    if (targetUserId) {
      query.email = targetUserId;
    } else if (targetRole) {
      query.role = targetRole;
    } else {
      // Use template roles
      query.role = { $in: template.roles };
    }

    const users = await usersCollection.find(query).toArray();
    
    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found with push subscriptions',
        sent: 0,
        templateId,
        targetRole,
        targetUserId
      });
    }

    // Build notification content with custom template overrides
    const notification = buildNotification({
      templateId: templateId as any,
      variables,
      title: title || customTemplate?.title,
      body: body || customTemplate?.body,
      url: url || customTemplate?.url
    });

    // Send notifications
    const webpush = require('web-push');
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

    webpush.setVapidDetails(
      'mailto:admin@peskinpro.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      url: notification.url,
      icon: '/favicon/android-chrome-192x192.png',
      badge: '/favicon/favicon-32x32.png',
    });

    const sendPromises = users.map(async (user) => {
      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        return { success: true, userId: user.email };
      } catch (error: any) {
        console.error(`Failed to send to ${user.email}:`, error);
        
        // If subscription is invalid, remove it
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

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successful} users`,
      sent: successful,
      failed,
      total: results.length,
      templateId,
      notification,
      targetRole,
      targetUserId,
      templateName: template.name
    });

  } catch (error) {
    console.error('Trigger notification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to trigger notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to test and list templates
export async function GET() {
  try {
    const { notificationTemplates } = await import('@/lib/notification-templates');
    
    return NextResponse.json({
      success: true,
      templates: notificationTemplates,
      usage: {
        endpoint: '/api/notifications/trigger',
        method: 'POST',
        body: {
          templateId: 'new_order_affiliate',
          variables: {
            orderId: 'ORD-001',
            amount: '250000',
            customerName: 'John Doe'
          },
          targetRole: 'affiliator'
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list templates' },
      { status: 500 }
    );
  }
}