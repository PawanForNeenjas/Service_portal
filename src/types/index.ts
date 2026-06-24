import type { LucideIcon } from "lucide-react";

export type Role = "CUSTOMER" | "DEALER" | "CUSTOMER_SERVICE" | "ADMIN";
export type PortalUserStatus = "PENDING" | "ACTIVE" | "REJECTED";

export type AuthUser = {
  id: number;
  login: string;
  partnerId?: number;
  odooUid: number;
  phone: string;
  status: PortalUserStatus;
  customerName?: string;
  customerId?: string;
  dealerId?: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  avatarInitials: string;
};

export type LoginPresetUser = {
  userId: string;
  partnerId?: number;
  customerId?: string;
  dealerId?: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  avatarInitials: string;
};

/* ===========================================================================
   RE-EXPORT DOMAIN TYPES
   =========================================================================== */

// Re-export from domain.ts to maintain compatibility
export type { TicketPriority, TicketStatus, WarrantyStatus } from "./domain";

/* ===========================================================================
   ENHANCED TYPES FOR SERVICE PORTAL
   =========================================================================== */

export type Priority = "Low" | "Medium" | "High" | "Critical";

export type IssueCategory =
  | "CHARGING_ISSUE"
  | "POWER_ISSUE"
  | "COMMUNICATION_ISSUE"
  | "INSTALLATION_ISSUE"
  | "HARDWARE_ISSUE"
  | "OTHER";

export const issueCategoryLabels: Record<IssueCategory, string> = {
  CHARGING_ISSUE: "Charging issue",
  POWER_ISSUE: "Power issue",
  COMMUNICATION_ISSUE: "Communication issue",
  INSTALLATION_ISSUE: "Installation issue",
  HARDWARE_ISSUE: "Hardware issue",
  OTHER: "Other",
};

/* ===========================================================================
   DASHBOARD TYPES
   =========================================================================== */

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "success" | "warning" | "error";
  icon: LucideIcon;
  path: string;
};

export type QuickAction = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export type Activity = {
  id: string;
  title: string;
  meta: string;
  time: string;
  tone: "primary" | "success" | "warning" | "error";
};
