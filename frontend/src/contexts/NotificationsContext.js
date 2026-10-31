import React, { createContext, useState, useContext, useEffect } from "react";
import notificationService from "../services/notificationService";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider",
    );
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [threadMessages, setThreadMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log("🔔 Loading notifications...");
      const response = await notificationService.getNotifications();
      console.log(
        "✅ Notifications loaded:",
        response.data.notifications.length,
        "unread:",
        response.data.unread_count,
      );
      setNotifications(response.data.notifications);
      setThreadMessages(response.data.thread_messages || response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error("❌ Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read_at: new Date() } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read_at: new Date() })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      setThreadMessages((prev) => prev.filter((notif) => notif.id !== id));
      setUnreadCount((prev) => {
        const notif = notifications.find((n) => n.id === id);
        return notif && !notif.read_at ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    if (!currentUser?.id) {
      console.log("⏭️ No user ID, skipping notification load");
      return;
    }

    console.log("📍 Loading notifications for user:", currentUser.id);
    loadNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      console.log("🔄 Refreshing notifications...");
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        threadMessages,
        unreadCount,
        loading,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
