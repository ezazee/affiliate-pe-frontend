import { NextRequest, NextResponse } from 'next/server';
import { webNotificationService } from '@/lib/web-notification-service';

export async function POST(req: NextRequest) {
  try {
    const { testType, data } = await req.json();

    switch (testType) {
      case 'registration':
        await testRegistrationNotification(data);
        break;
      case 'order':
        await testOrderNotification(data);
        break;
      case 'withdrawal':
        await testWithdrawalNotification(data);
        break;
      case 'all':
        await testAllNotifications(data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Web notification test completed for ${testType}` 
    });

  } catch (error) {
    console.error('Web notification test error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Web Notification Test API',
    endpoints: [
      'POST /api/web/test/notifications/registration - Test new affiliator registration',
      'POST /api/web/test/notifications/order - Test new order',
      'POST /api/web/test/notifications/withdrawal - Test withdrawal request',
      'POST /api/web/test/notifications/all - Test all notifications'
    ]
  });
}

async function testRegistrationNotification(data: any) {
  const { name, email } = data || {
    name: 'Test Affiliator',
    email: 'test@affiliate.com'
  };

  await webNotificationService.notifyNewAffiliate(name, email);
  console.log(`✅ Web notification sent: ${name} (${email})`);
}

async function testOrderNotification(data: any) {
  const { orderNumber, customerName, total, commission, targetUserEmail } = data || {
    orderNumber: 'ORDER-TEST123',
    customerName: 'Test Customer',
    total: 'Rp 150,000',
    commission: 'Rp 15,000',
    targetUserEmail: 'adm.peskinproid@gmail.com'
  };

  await webNotificationService.notifyNewOrderAffiliate(orderNumber, customerName, commission, targetUserEmail);
  console.log(`✅ Web notification sent: ${orderNumber}`);
}

async function testWithdrawalNotification(data: any) {
  const { affiliateName, amount, targetUserEmail } = data || {
    affiliateName: 'Test Affiliate',
    amount: 'Rp 100,000',
    targetUserEmail: 'adm.peskinproid@gmail.com'
  };

  await webNotificationService.notifyWithdrawalApproved(amount, new Date().toLocaleString('id-ID'), targetUserEmail);
  await webNotificationService.notifyBalanceUpdated('Rp 50,000', targetUserEmail);
  console.log(`✅ Web notification sent: ${amount}`);
}

async function testAllNotifications(data: any) {
  const testEmail = data?.email || 'adm.peskinproid@gmail.com';

  console.log('🧪 Testing ALL web notification types...');

  // 1. Admin Notifications
  await webNotificationService.notifyNewAffiliate('John Doe', 'john@example.com');
  await webNotificationService.notifyNewOrderAdmin('ORDER-ALL001', 'Jane Smith', 'Rp 200,000');
  await webNotificationService.notifyWithdrawalRequest('Alice Johnson', 'Rp 150,000');

  // 2. Affiliator Notifications
  await webNotificationService.notifyNewOrderAffiliate('ORDER-ALL002', 'Bob Wilson', 'Rp 20,000', testEmail);
  await webNotificationService.notifyOrderShipped('ORDER-ALL003', 'Charlie Brown', testEmail);
  await webNotificationService.notifyOrderCompleted('ORDER-ALL004', 'Diana Prince', testEmail);
  await webNotificationService.notifyCommissionEarned('Rp 25,000', 'ORDER-ALL005', testEmail);
  await webNotificationService.notifyBalanceUpdated('Rp 75,000', testEmail);
  await webNotificationService.notifyWithdrawalApproved('Rp 50,000', '22/01/2026 10:30', testEmail);
  await webNotificationService.notifyWithdrawalRejected('Rp 30,000', 'Insufficient balance', testEmail);

  console.log('✅ ALL web notification tests completed');
}