import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevUnreadIdsRef = useRef(new Set());
  const initialFetchDoneRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      prevUnreadIdsRef.current.clear();
      initialFetchDoneRef.current = false;
      return;
    }

    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);

      const currUnread = data.filter((n) => !n.isRead);
      const currUnreadIds = new Set(currUnread.map((n) => n._id));

      if (initialFetchDoneRef.current) {
        currUnread.forEach((n) => {
          if (!prevUnreadIdsRef.current.has(n._id)) {
            if (n.type === 'success') toast.success(n.title + ': ' + n.message);
            else if (n.type === 'error') toast.error(n.title + ': ' + n.message);
            else toast.info(n.title + ': ' + n.message);
          }
        });
      } else {
        initialFetchDoneRef.current = true;
      }

      prevUnreadIdsRef.current = currUnreadIds;
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchNotifications();

    if (user) {
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, user]);

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await api.put('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      prevUnreadIdsRef.current.clear();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
