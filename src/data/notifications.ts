import type { Notification } from "../types/domain";

export const notifications: Notification[] = [
  {
    id: "N001",
    title: "Replacement approved for TCK-2025-001",
    meta: "Aqua Pro AQP-220",
    time: "12 min ago",
    tone: "success",
    read: false,
    path: "/tickets/T001",
  },
  {
    id: "N002",
    title: "Ticket created",
    meta: "TCM-584402-20260623-001",
    time: "38 min ago",
    tone: "primary",
    read: false,
    path: "/tickets/T002",
  },
  {
    id: "N003",
    title: "Photo evidence requested",
    meta: "TCK-2025-002",
    time: "1 hr ago",
    tone: "warning",
    read: false,
    path: "/tickets/T002",
  },
];
