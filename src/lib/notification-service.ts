import { NotificationConfig, NotificationTemplateId } from '@/lib/notification-templates';

class NotificationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  async triggerNotification(config: NotificationConfig): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error triggering notification:', error);
      throw error;
    }
  }

  // Admin Notifications
  async notifyNewAffiliate(name: string, email: string) {
    return this.triggerNotification({
      templateId: 'new_affiliate',
      variables: { name, email },
      targetRole: 'admin'
    });
  }

  async notifyNewOrderAdmin(orderId: string, amount: string | number, customerName: string) {
    return this.triggerNotification({
      templateId: 'new_order_admin',
      variables: { orderId, amount, customerName },
      targetRole: 'admin'
    });
  }

  async notifyWithdrawalRequest(name: string, amount: string | number) {
    return this.triggerNotification({
      templateId: 'withdrawal_request',
      variables: { name, amount },
      targetRole: 'admin'
    });
  }

  // Affiliator Notifications
  async notifyNewOrderAffiliate(orderId: string, amount: string | number, targetUserId?: string) {
    return this.triggerNotification({
      templateId: 'new_order_affiliate',
      variables: { orderId, amount },
      targetUserId
    });
  }

  async notifyOrderShipped(orderId: string, targetUserId?: string) {
    return this.triggerNotification({
      templateId: 'order_shipped',
      variables: { orderId },
      targetUserId
    });
  }

  async notifyOrderCompleted(orderId: string, targetUserId?: string) {
    return this.triggerNotification({
      templateId: 'order_completed',
      variables: { orderId },
      targetUserId
    });
  }

  async notifyCommissionEarned(orderId: string, amount: string | number, targetUserId?: string) {
    return this.triggerNotification({
      templateId: 'commission_earned',
      variables: { orderId, amount },
      targetUserId
    });
  }

  async notifyBalanceUpdated(balance: string | number, targetUserId?: string) {
    return this.triggerNotification({
      templateId: 'balance_updated',
      variables: { balance },
      targetUserId
    });
  }

  async notifyWithdrawalApproved(amount: string | number, targetUserId?: string) {
    return this.triggerNotification({
      templateId: 'withdrawal_approved',
      variables: { amount },
      targetUserId
    });
  }

  async notifyWithdrawalRejected(amount: string | number, reason: string, targetUserId?: string) {
    return this.triggerNotification({
      templateId: 'withdrawal_rejected',
      variables: { amount, reason },
      targetUserId
    });
  }
}

export const notificationService = new NotificationService();