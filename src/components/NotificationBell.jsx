import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, XCircle, Info, CheckCheck } from "lucide-react";
import api from "../api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res?.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead({ markAll: true });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.markNotificationsRead({ notificationIds: [id] });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n) => {
    // Mark single notification as read if unread
    if (!n.isRead) {
      handleMarkSingleRead(n._id, false);
    }

    // Close notification dropdown
    setIsOpen(false);

    // Determine redirect path
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
    const userRole = String(loggedInUser?.role || "").toLowerCase();

    let targetPath = "";

    if (n.link || n.route || n.url) {
      targetPath = n.link || n.route || n.url;
    } else {
      const type = (n.type || "").toLowerCase();
      const title = (n.title || "").toLowerCase();
      const msg = (n.message || "").toLowerCase();

      if (userRole === "admin") {
        if (type.includes("leave") || title.includes("leave") || msg.includes("leave")) {
          targetPath = "/admin/attendance";
        } else if (type.includes("payroll") || title.includes("payroll") || msg.includes("salary") || msg.includes("payroll")) {
          targetPath = "/admin/payroll";
        } else if (title.includes("employee") || msg.includes("employee")) {
          targetPath = "/admin/employee";
        } else if (title.includes("notice") || title.includes("announcement") || msg.includes("notice")) {
          targetPath = "/admin/notices";
        } else if (title.includes("department")) {
          targetPath = "/admin/departments";
        } else if (title.includes("designation")) {
          targetPath = "/admin/designations";
        } else if (title.includes("role")) {
          targetPath = "/admin/roles";
        } else {
          targetPath = "/admin/dashboard";
        }
      } else {
        // Employee role navigation
        if (type.includes("leave") || title.includes("leave") || msg.includes("leave")) {
          targetPath = "/employee/leave";
        } else if (type.includes("payroll") || title.includes("payroll") || msg.includes("salary") || msg.includes("payslip")) {
          targetPath = "/employee/payroll";
        } else if (type.includes("attendance") || title.includes("attendance") || msg.includes("attendance")) {
          targetPath = "/employee/attendance";
        } else if (type.includes("notice") || title.includes("notice") || title.includes("announcement") || msg.includes("notice") || msg.includes("announcement")) {
          targetPath = "/employee/announcements";
        } else if (title.includes("profile") || msg.includes("profile")) {
          targetPath = "/employee/profile";
        } else {
          targetPath = "/employee/dashboard";
        }
      }
    }

    if (targetPath) {
      navigate(targetPath);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "leave_approved":
        return <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />;
      case "leave_rejected":
        return <XCircle size={18} className="text-red-500 shrink-0" />;
      case "leave_applied":
        return <Info size={18} className="text-blue-500 shrink-0" />;
      default:
        return <Info size={18} className="text-teal-500 shrink-0" />;
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "8px",
          borderRadius: "10px",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        aria-label="Notifications"
      >
        <Bell size={20} color="#334155" />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              display: "flex",
              height: "18px",
              minWidth: "18px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9999px",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: "800",
              padding: "0 4px",
              boxShadow: "0 0 0 2px #ffffff"
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            marginTop: "8px",
            width: "340px",
            maxWidth: "calc(100vw - 32px)",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
            zIndex: 100,
            overflow: "hidden"
          }}
        >
          {/* Dropdown Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid #f1f5f9",
              backgroundColor: "#f8fafc"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: "#e0e7ff",
                    color: "#4338ca",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "10px"
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#0d9488",
                  background: "none",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: n.isRead ? "#ffffff" : "#f0fdf4",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                >
                  <div style={{ marginTop: "2px" }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{n.title}</p>
                      <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "500" }}>{timeAgo(n.createdAt)}</span>
                    </div>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <span
                      style={{
                        height: "8px",
                        width: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                        marginTop: "6px",
                        flexShrink: 0
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
