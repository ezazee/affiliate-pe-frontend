"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Settings } from 'lucide-react';
import { PushNotificationSender } from '@/components/admin/push-notification-sender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import the templates management component we'll create
import NotificationTemplatesManager from '@/components/admin/notification-templates-manager';

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Notifikasi Push
          </h1>
          <p className="text-muted-foreground">
            Kelola pengiriman dan template notifikasi
          </p>
        </div>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Kirim Notifikasi
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Template Notifikasi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <PushNotificationSender />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <NotificationTemplatesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}