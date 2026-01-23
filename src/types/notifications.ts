export interface WebNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  url?: string;
  actionUrl?: string;
  data?: any;
}

export interface NotificationState {
  notifications: WebNotification[];
  unreadCount: number;
  isOpen: boolean;
}

export type NotificationAction = 
  | { type: 'ADD_NOTIFICATION'; payload: Omit<WebNotification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'TOGGLE_NOTIFICATIONS_PANEL' }
  | { type: 'ADD_MULTIPLE_NOTIFICATIONS'; payload: Omit<WebNotification, 'id' | 'timestamp' | 'read'>[] };