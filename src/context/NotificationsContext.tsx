import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  autoClose?: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, autoClose: true, ...notification }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    notifications.forEach((notification) => {
      if (notification.autoClose) {
        const timeout = setTimeout(() => {
          removeNotification(notification.id);
        }, 5000);
        
        timeouts.push(timeout);
      }
    });
    
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [notifications]);

  return (
    <NotificationsContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
      <AnimatePresence>
        <div className="fixed right-0 top-0 z-50 flex max-h-screen flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto">
          {notifications.map((notification) => (
            <NotificationToast 
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </div>
      </AnimatePresence>
    </NotificationsContext.Provider>
  );
};

const NotificationToast: React.FC<{ 
  notification: Notification; 
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const { type, message, title } = notification;
  
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };
  
  const styles = {
    success: 'bg-success-100 text-success-900 border-success-500',
    error: 'bg-error-100 text-error-900 border-error-500',
    warning: 'bg-warning-100 text-warning-900 border-warning-500',
    info: 'bg-primary-100 text-primary-900 border-primary-500',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`w-80 rounded-lg border-l-4 bg-white p-4 shadow-card ${styles[type]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="mr-3 flex-shrink-0">{icons[type]}</div>
          <div>
            {title && <h4 className="font-medium">{title}</h4>}
            <p className="text-sm">{message}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 flex-shrink-0 rounded-full p-1 hover:bg-neutral-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};