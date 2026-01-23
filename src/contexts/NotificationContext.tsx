'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { WebNotification, NotificationState, NotificationAction } from '@/types/notifications';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotification: WebNotification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
      };
      
      const updatedNotifications = [newNotification, ...state.notifications];
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    }

    case 'ADD_MULTIPLE_NOTIFICATIONS': {
      const newNotifications: WebNotification[] = action.payload.map(payload => ({
        ...payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      }));
      
      const updatedNotifications = [...newNotifications, ...state.notifications];
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    }

    case 'MARK_AS_READ': {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload ? { ...notification, read: true } : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    }

    case 'MARK_ALL_AS_READ': {
      const updatedNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true,
      }));
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: 0,
      };
    }

    case 'REMOVE_NOTIFICATION': {
      const updatedNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    }

    case 'TOGGLE_NOTIFICATIONS_PANEL': {
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    }

    default:
      return state;
  }
}

interface NotificationContextType {
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
  addNotification: (notification: Omit<WebNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  togglePanel: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = (notification: Omit<WebNotification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const togglePanel = () => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS_PANEL' });
  };

  // Auto-remove notifications after 30 seconds for info notifications
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const thirtySecondsAgo = now - 30000;

      state.notifications.forEach(notification => {
        if (
          notification.type === 'info' && 
          !notification.read && 
          notification.timestamp.getTime() < thirtySecondsAgo
        ) {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
        }
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [state.notifications]);

  return (
    <NotificationContext.Provider
      value={{
        state,
        dispatch,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        togglePanel,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}