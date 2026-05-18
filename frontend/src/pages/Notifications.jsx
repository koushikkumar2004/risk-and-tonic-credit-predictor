import { motion } from 'framer-motion';
import { Bell, CheckCircle, AlertCircle, Info, Clock, Check } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const iconMap = {
  success: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
};

const bgMap = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
};

export default function Notifications() {
  const { notifications, unreadCount, markAllAsRead, loading } = useNotifications();

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading notifications...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Bell className="w-7 h-7 text-blue-600" />
              Notifications
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              You have <span className="font-semibold text-blue-600">{unreadCount} unread</span> notifications.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 transition-colors bg-blue-50 dark:bg-blue-900/40 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800"
            >
              <Check className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              No notifications found.
            </div>
          ) : (
            notifications.map((n, i) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative flex gap-4 p-5 rounded-xl border ${bgMap[n.type] || bgMap.info} transition-all ${n.isRead ? 'opacity-70 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : ''}`}
              >
                {!n.isRead && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                )}
                <div className="mt-0.5 flex-shrink-0">{iconMap[n.type] || iconMap.info}</div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${n.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {n.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 dark:text-slate-500">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
