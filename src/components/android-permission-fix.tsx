'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AndroidPermissionFix() {
  const [isOpen, setIsOpen] = useState(false);

  const fixInstructions = [
    {
      title: "Chrome Settings Fix",
      steps: [
        "Open Chrome menu (⋮)",
        "Go to Settings → Site Settings",
        "Select Notifications",
        "Find this domain and set to Allow"
      ]
    },
    {
      title: "Android Settings Fix", 
      steps: [
        "Go to Android Settings",
        "Apps → Chrome",
        "Permissions → Notifications",
        "Set to Allow"
      ]
    },
    {
      title: "Quick Fix",
      steps: [
        "Clear Chrome cache",
        "Restart Chrome browser", 
        "Try enabling notifications again",
        "Accept permission prompt immediately"
      ]
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-yellow-800">Permission Denied?</CardTitle>
          <CardDescription className="text-xs text-yellow-700">
            Android users - follow these steps
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-xs mb-2"
          >
            {isOpen ? 'Hide' : 'Show'} Android Fix
          </Button>
          
          {isOpen && (
            <div className="space-y-3">
              {fixInstructions.map((fix, index) => (
                <div key={index} className="bg-white p-2 rounded border border-yellow-300">
                  <h4 className="font-medium text-xs text-yellow-900 mb-1">{fix.title}</h4>
                  <ol className="text-xs text-yellow-800 space-y-0.5">
                    {fix.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex">
                        <span className="mr-1">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
              
              <Button
                size="sm"
                onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
                className="w-full text-xs bg-yellow-600 hover:bg-yellow-700"
              >
                Open Chrome Notification Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}