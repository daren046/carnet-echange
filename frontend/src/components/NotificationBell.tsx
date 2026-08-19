import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/client";
import type { AppNotification } from "../types";

export function NotificationBell({ onDark = false }: { onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const loadCount = () => {
    getUnreadNotificationCount()
      .then((res) => setUnread(res.data.count))
      .catch(() => setUnread(0));
  };

  const loadList = () => {
    getNotifications()
      .then((res) => setItems(res.data))
      .catch(() => setItems([]));
  };

  useEffect(() => {
    loadCount();
    const id = window.setInterval(loadCount, 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadList();
  };

  const handleRead = async (n: AppNotification) => {
    if (!n.read) {
      await markNotificationRead(n.id);
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
      setUnread((c) => Math.max(0, c - 1));
    }
    setOpen(false);
  };

  const handleAll = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className={`relative rounded-lg p-2 ${
          onDark
            ? "text-white/80 hover:bg-white/10 hover:text-white"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={handleAll} className="text-xs font-medium text-emerald-700 hover:underline">
                Tout lu
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-400">Aucune notification</p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  to={n.link || "/"}
                  onClick={() => handleRead(n)}
                  className={`block border-b border-slate-50 px-3 py-3 text-left hover:bg-slate-50 ${
                    n.read ? "opacity-70" : "bg-emerald-50/40"
                  }`}
                >
                  <p className="text-[13px] font-medium text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{n.message}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleString("fr-FR")}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
