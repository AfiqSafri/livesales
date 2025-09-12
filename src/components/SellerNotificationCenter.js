"use client";
import { useState, useEffect } from 'react';
import { useSellerLanguage } from '../app/seller/SellerLanguageContext';

export default function SellerNotificationCenter({ seller }) {
  const { language } = useSellerLanguage() || { language: 'en' };
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const translations = {
    en: {
      title: 'Notifications',
      noNotifications: 'No notifications',
      markAllRead: 'Mark All as Read',
      showAll: 'Show All',
      showLess: 'Show Less',
      newReceipt: 'New Payment Receipt',
      receiptUploaded: 'Payment receipt uploaded',
      viewReceipts: 'View Receipts',
      justNow: 'Just now',
      minutesAgo: 'minutes ago',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago'
    },
    ms: {
      title: 'Notifikasi',
      noNotifications: 'Tiada notifikasi',
      markAllRead: 'Tandakan Semua Dibaca',
      showAll: 'Tunjuk Semua',
      showLess: 'Tunjuk Sedikit',
      newReceipt: 'Resit Pembayaran Baru',
      receiptUploaded: 'Resit pembayaran dimuat naik',
      viewReceipts: 'Lihat Resit',
      justNow: 'Baru sahaja',
      minutesAgo: 'minit yang lalu',
      hoursAgo: 'jam yang lalu',
      daysAgo: 'hari yang lalu'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (seller?.id) {
      fetchNotifications();
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [seller?.id]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${seller.id}&isRead=false`);
      const data = await response.json();
      
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, isRead: true })
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(notif => 
          fetch('/api/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: notif.id, isRead: true })
          })
        )
      );
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return t.justNow;
    if (diffInMinutes < 60) return `${diffInMinutes} ${t.minutesAgo}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${t.hoursAgo}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${t.daysAgo}`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'receipt_uploaded':
        return 'fas fa-receipt text-blue-600';
      case 'order_update':
        return 'fas fa-shopping-cart text-green-600';
      default:
        return 'fas fa-bell text-gray-600';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'receipt_uploaded':
        return 'bg-blue-50 border-blue-200';
      case 'order_update':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{t.title}</h3>
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {t.markAllRead}
              </button>
            )}
            {notifications.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                {showAll ? t.showLess : t.showAll}
              </button>
            )}
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-bell text-gray-400 text-lg"></i>
          </div>
          <p className="text-gray-500">{t.noNotifications}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                notification.isRead ? 'opacity-75' : ''
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <i className={`${getNotificationIcon(notification.type)} text-sm`}></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2">
                      {getTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  {notification.type === 'receipt_uploaded' && (
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          markAsRead(notification.id);
                          window.location.href = '/seller/dashboard';
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {t.viewReceipts}
                      </button>
                    </div>
                  )}
                </div>
                {!notification.isRead && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
