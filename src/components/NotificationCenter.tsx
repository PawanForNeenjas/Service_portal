import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useAuthService } from "../services/api/auth";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function NotificationCenter() {
  const { notifications, markNotificationsRead } = useAuthService();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((notification) => !notification.read).length;

  function handleOpen() {
    setOpen((value) => !value);
    markNotificationsRead();
  }

  return (
    <div className="relative">
      <Button type="button" variant="ghost" size="icon" aria-label="Open notifications" onClick={handleOpen}>
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unread ? (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-error ring-2 ring-background" />
        ) : null}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 z-[65] w-[calc(100vw-2rem)] max-w-sm rounded-lg border bg-white p-3 shadow-soft"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Notifications</p>
                <p className="text-xs text-slate-500">Latest service signals</p>
              </div>
              <Badge tone="primary">Live</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {notifications.map((activity) => {
                const content = (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {activity.meta} - {activity.time}
                      </p>
                    </div>
                  </div>
                );

                return activity.path && isSafeNotificationPath(activity.path) ? (
                  <Link
                    key={activity.id}
                    to={activity.path}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg bg-slate-50 p-3 transition hover:bg-sky-50"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={activity.id} className="rounded-lg bg-slate-50 p-3">
                    {content}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function isSafeNotificationPath(path: string) {
  if (path.startsWith("/products/") || path.startsWith("/tickets/")) {
    const [, resource, id] = path.split("/");
    return Boolean(resource && /^\d+$/.test(id ?? ""));
  }

  return true;
}
