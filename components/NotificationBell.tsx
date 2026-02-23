'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useUser } from '@/context/AuthContext';

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const { user, isSignedIn } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayList = notifications.slice(0, 5);

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;
    setLoading(true);
    fetch(`/api/notifications?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setNotifications(data.notifications || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setOpen(false);
  };

  if (!isSignedIn) {
    return (
      <div className="relative" ref={panelRef}>
        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          whileHover={{ scale: 1.15, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors group"
          aria-label="Notification"
        >
          <Bell className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" strokeWidth={1.2} />
        </motion.button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-xl shadow-lg border border-gray-200 z-[100] p-4"
            >
              <p className="text-sm text-gray-600 mb-3">Sign in to view notifications.</p>
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="block w-full text-center py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" ref={panelRef}>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.15, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors group"
        aria-label="Notification"
      >
        <Bell className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" strokeWidth={1.2} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" aria-hidden />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[320px] max-h-[320px] overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200 z-[100]"
          >
            <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900">
              Notifications
            </div>
            <div className="max-h-[260px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
              ) : displayList.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No notifications</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {displayList.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => markAsRead(n.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-orange-50/50' : ''}`}
                      >
                        <p className={`text-sm font-medium ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleDateString('mn-MN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
