"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Users, ShoppingCart, DollarSign, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/lib/notification-service';

export default function NotificationTestPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState('');

  const triggerNotification = async (name: string, action: () => Promise<any>) => {
    setLoading(name);
    try {
      const result = await action();
      toast({
        title: 'Success',
        description: result.message || `${name} triggered successfully`,
      });
      console.log(`${name} result:`, result);
    } catch (error) {
      console.error(`Error triggering ${name}:`, error);
      toast({
        title: 'Error',
        description: `Failed to trigger ${name}`,
        variant: 'destructive'
      });
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Automatic Notifications</h1>
        <p className="text-muted-foreground">
          Test trigger automatic notifications for different events
        </p>
      </div>

      <Tabs defaultValue="admin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="admin">Admin Notifications</TabsTrigger>
          <TabsTrigger value="affiliate">Affiliate Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  New Affiliate Registration
                </CardTitle>
                <CardDescription>Trigger when new affiliate registers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Affiliate Name</label>
                  <Input id="affName" placeholder="John Doe" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input id="affEmail" placeholder="john@example.com" defaultValue="john@example.com" />
                </div>
                <Button 
                  onClick={() => {
                    const name = (document.getElementById('affName') as HTMLInputElement)?.value;
                    const email = (document.getElementById('affEmail') as HTMLInputElement)?.value;
                    triggerNotification('New Affiliate Registration', () => 
                      notificationService.notifyNewAffiliate(name, email)
                    );
                  }}
                  disabled={loading === 'New Affiliate Registration'}
                  className="w-full"
                >
                  {loading === 'New Affiliate Registration' ? 'Sending...' : 'Test Notification'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  New Order (Admin)
                </CardTitle>
                <CardDescription>Trigger when new order is placed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order ID</label>
                  <Input id="orderId" placeholder="ORD-001" defaultValue="ORD-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input id="orderAmount" placeholder="250000" defaultValue="250000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Name</label>
                  <Input id="customerName" placeholder="Jane Smith" defaultValue="Jane Smith" />
                </div>
                <Button 
                  onClick={() => {
                    const orderId = (document.getElementById('orderId') as HTMLInputElement)?.value;
                    const amount = (document.getElementById('orderAmount') as HTMLInputElement)?.value;
                    const customerName = (document.getElementById('customerName') as HTMLInputElement)?.value;
                    triggerNotification('New Order (Admin)', () => 
                      notificationService.notifyNewOrderAdmin(orderId, amount, customerName)
                    );
                  }}
                  disabled={loading === 'New Order (Admin)'}
                  className="w-full"
                >
                  {loading === 'New Order (Admin)' ? 'Sending...' : 'Test Notification'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Withdrawal Request
                </CardTitle>
                <CardDescription>Trigger when affiliate requests withdrawal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Affiliate Name</label>
                  <Input id="withdrawName" placeholder="John Doe" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input id="withdrawAmount" placeholder="500000" defaultValue="500000" />
                </div>
                <Button 
                  onClick={() => {
                    const name = (document.getElementById('withdrawName') as HTMLInputElement)?.value;
                    const amount = (document.getElementById('withdrawAmount') as HTMLInputElement)?.value;
                    triggerNotification('Withdrawal Request', () => 
                      notificationService.notifyWithdrawalRequest(name, amount)
                    );
                  }}
                  disabled={loading === 'Withdrawal Request'}
                  className="w-full"
                >
                  {loading === 'Withdrawal Request' ? 'Sending...' : 'Test Notification'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="affiliate" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  New Order (Affiliate)
                </CardTitle>
                <CardDescription>Trigger when affiliate gets new order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order ID</label>
                  <Input id="affOrderId" placeholder="ORD-002" defaultValue="ORD-002" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input id="affOrderAmount" placeholder="150000" defaultValue="150000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target User (Optional)</label>
                  <Input id="affTargetUser" placeholder="affiliate@example.com" />
                </div>
                <Button 
                  onClick={() => {
                    const orderId = (document.getElementById('affOrderId') as HTMLInputElement)?.value;
                    const amount = (document.getElementById('affOrderAmount') as HTMLInputElement)?.value;
                    const targetUser = (document.getElementById('affTargetUser') as HTMLInputElement)?.value;
                    triggerNotification('New Order (Affiliate)', () => 
                      notificationService.notifyNewOrderAffiliate(orderId, amount, targetUser)
                    );
                  }}
                  disabled={loading === 'New Order (Affiliate)'}
                  className="w-full"
                >
                  {loading === 'New Order (Affiliate)' ? 'Sending...' : 'Test Notification'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Order Shipped
                </CardTitle>
                <CardDescription>Trigger when order is shipped</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order ID</label>
                  <Input id="shipOrderId" placeholder="ORD-002" defaultValue="ORD-002" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target User (Optional)</label>
                  <Input id="shipTargetUser" placeholder="affiliate@example.com" />
                </div>
                <Button 
                  onClick={() => {
                    const orderId = (document.getElementById('shipOrderId') as HTMLInputElement)?.value;
                    const targetUser = (document.getElementById('shipTargetUser') as HTMLInputElement)?.value;
                    triggerNotification('Order Shipped', () => 
                      notificationService.notifyOrderShipped(orderId, targetUser)
                    );
                  }}
                  disabled={loading === 'Order Shipped'}
                  className="w-full"
                >
                  {loading === 'Order Shipped' ? 'Sending...' : 'Test Notification'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Order Completed
                </CardTitle>
                <CardDescription>Trigger when order is completed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order ID</label>
                  <Input id="compOrderId" placeholder="ORD-002" defaultValue="ORD-002" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target User (Optional)</label>
                  <Input id="compTargetUser" placeholder="affiliate@example.com" />
                </div>
                <Button 
                  onClick={() => {
                    const orderId = (document.getElementById('compOrderId') as HTMLInputElement)?.value;
                    const targetUser = (document.getElementById('compTargetUser') as HTMLInputElement)?.value;
                    triggerNotification('Order Completed', () => 
                      notificationService.notifyOrderCompleted(orderId, targetUser)
                    );
                  }}
                  disabled={loading === 'Order Completed'}
                  className="w-full"
                >
                  {loading === 'Order Completed' ? 'Sending...' : 'Test Notification'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Commission Earned
                </CardTitle>
                <CardDescription>Trigger when commission is earned</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order ID</label>
                  <Input id="commOrderId" placeholder="ORD-002" defaultValue="ORD-002" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Commission Amount</label>
                  <Input id="commAmount" placeholder="15000" defaultValue="15000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target User (Optional)</label>
                  <Input id="commTargetUser" placeholder="affiliate@example.com" />
                </div>
                <Button 
                  onClick={() => {
                    const orderId = (document.getElementById('commOrderId') as HTMLInputElement)?.value;
                    const amount = (document.getElementById('commAmount') as HTMLInputElement)?.value;
                    const targetUser = (document.getElementById('commTargetUser') as HTMLInputElement)?.value;
                    triggerNotification('Commission Earned', () => 
                      notificationService.notifyCommissionEarned(orderId, amount, targetUser)
                    );
                  }}
                  disabled={loading === 'Commission Earned'}
                  className="w-full"
                >
                  {loading === 'Commission Earned' ? 'Sending...' : 'Test Notification'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Balance Updated
                </CardTitle>
                <CardDescription>Trigger when available balance updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Balance</label>
                  <Input id="newBalance" placeholder="250000" defaultValue="250000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target User (Optional)</label>
                  <Input id="balanceTargetUser" placeholder="affiliate@example.com" />
                </div>
                <Button 
                  onClick={() => {
                    const balance = (document.getElementById('newBalance') as HTMLInputElement)?.value;
                    const targetUser = (document.getElementById('balanceTargetUser') as HTMLInputElement)?.value;
                    triggerNotification('Balance Updated', () => 
                      notificationService.notifyBalanceUpdated(balance, targetUser)
                    );
                  }}
                  disabled={loading === 'Balance Updated'}
                  className="w-full"
                >
                  {loading === 'Balance Updated' ? 'Sending...' : 'Test Notification'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Withdrawal Approved
                </CardTitle>
                <CardDescription>Trigger when withdrawal is approved</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input id="apprAmount" placeholder="100000" defaultValue="100000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target User (Optional)</label>
                  <Input id="apprTargetUser" placeholder="affiliate@example.com" />
                </div>
                <Button 
                  onClick={() => {
                    const amount = (document.getElementById('apprAmount') as HTMLInputElement)?.value;
                    const targetUser = (document.getElementById('apprTargetUser') as HTMLInputElement)?.value;
                    triggerNotification('Withdrawal Approved', () => 
                      notificationService.notifyWithdrawalApproved(amount, targetUser)
                    );
                  }}
                  disabled={loading === 'Withdrawal Approved'}
                  className="w-full"
                >
                  {loading === 'Withdrawal Approved' ? 'Sending...' : 'Test Notification'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Withdrawal Rejected
                </CardTitle>
                <CardDescription>Trigger when withdrawal is rejected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input id="rejAmount" placeholder="100000" defaultValue="100000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason</label>
                  <Input id="rejReason" placeholder="Insufficient balance" defaultValue="Insufficient balance" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target User (Optional)</label>
                  <Input id="rejTargetUser" placeholder="affiliate@example.com" />
                </div>
                <Button 
                  onClick={() => {
                    const amount = (document.getElementById('rejAmount') as HTMLInputElement)?.value;
                    const reason = (document.getElementById('rejReason') as HTMLInputElement)?.value;
                    const targetUser = (document.getElementById('rejTargetUser') as HTMLInputElement)?.value;
                    triggerNotification('Withdrawal Rejected', () => 
                      notificationService.notifyWithdrawalRejected(amount, reason, targetUser)
                    );
                  }}
                  disabled={loading === 'Withdrawal Rejected'}
                  className="w-full"
                >
                  {loading === 'Withdrawal Rejected' ? 'Sending...' : 'Test Notification'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}