import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { notificationTemplates, NotificationTemplateId } from '@/lib/notification-templates';

interface CustomNotificationTemplate {
  templateId: NotificationTemplateId;
  title?: string;
  body?: string;
  url?: string;
  enabled: boolean;
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const settingsCollection = db.collection('settings');
    
    // Get custom notification templates from database
    const customTemplates = await settingsCollection.findOne({ key: 'notificationTemplates' });
    
    // Merge with default templates
    const mergedTemplates = notificationTemplates.map(template => {
      const custom = customTemplates?.templates?.find((t: any) => t.templateId === template.id);
      
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        defaultTitle: template.defaultTitle,
        defaultBody: template.defaultBody,
        defaultUrl: template.defaultUrl,
        roles: template.roles,
        category: template.category,
        customTitle: custom?.title || '',
        customBody: custom?.body || '',
        customUrl: custom?.url || '',
        enabled: custom?.enabled !== false, // default to true
        isCustomized: !!custom
      };
    });

    return NextResponse.json({
      success: true,
      templates: mergedTemplates
    });

  } catch (error) {
    console.error('Get notification templates error:', error);
    return NextResponse.json(
      { error: 'Failed to get notification templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templates }: { templates: CustomNotificationTemplate[] } = await request.json();

    const client = await clientPromise;
    const db = client.db();
    const settingsCollection = db.collection('settings');

    // Validate template IDs
    const validTemplateIds = notificationTemplates.map(t => t.id);
    for (const template of templates) {
      if (!validTemplateIds.includes(template.templateId)) {
        return NextResponse.json(
          { error: `Invalid template ID: ${template.templateId}` },
          { status: 400 }
        );
      }
    }

    // Save custom templates
    await settingsCollection.updateOne(
      { key: 'notificationTemplates' },
      { 
        $set: { 
          key: 'notificationTemplates',
          templates,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Notification templates updated successfully',
      updated: templates.length
    });

  } catch (error) {
    console.error('Update notification templates error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification templates' },
      { status: 500 }
    );
  }
}