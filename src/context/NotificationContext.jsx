import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications for user
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`medicare_notifications_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Save to local storage whenever notifications change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`medicare_notifications_${user.id}`, JSON.stringify(notifications));
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications, user]);

  // Request browser permission
  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }
    }
  };

  const notify = (title, message, type = 'info', link = null, targetUserId = null) => {
    const targetId = targetUserId || (user ? user.id : null);
    if (!targetId) return;

    const newNotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      link,
      read: false,
      createdAt: new Date().toISOString()
    };

    if (targetId === (user ? user.id : null)) {
      setNotifications(prev => [newNotification, ...prev]);
      
      // Show browser notification if permitted (only if for current user)
      if ('Notification' in window && Notification.permission === 'granted') {
        new window.Notification(title, {
          body: message,
          icon: '/favicon.svg'
        });
      }
    } else {
      // Save directly to target user's local storage
      const saved = localStorage.getItem(`medicare_notifications_${targetId}`);
      const parsed = saved ? JSON.parse(saved) : [];
      localStorage.setItem(`medicare_notifications_${targetId}`, JSON.stringify([newNotification, ...parsed]));
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      notify,
      markAsRead,
      markAllAsRead,
      removeNotification,
      requestBrowserPermission
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
