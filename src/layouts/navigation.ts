import {
  BadgeCheck,
  Boxes,
  ClipboardCheck,
  ClipboardList,
  ClipboardPlus,
  FileBarChart,
  Headphones,
  Home,
  LayoutDashboard,
  ListChecks,
  PackageCheck,
  PackagePlus,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Sparkles,
  TicketCheck,
  UserCheck,
  Users,
  Warehouse,
} from "lucide-react";
import type { Role } from "../types";
import { isWarrantyModuleEnabled } from "../utils/releaseFlags";

/* ===========================================================================
   ZONE DEFINITIONS
   =========================================================================== */

export type Zone = "CUSTOMER" | "PARTNER" | "OPERATIONS" | "ADMIN";

export const roleToZone: Record<Role, Zone> = {
  CUSTOMER: "CUSTOMER",
  DEALER: "PARTNER",
  CUSTOMER_SERVICE: "OPERATIONS",
  ADMIN: "ADMIN",
};

export const zoneConfig: Record<Zone, { label: string; icon: typeof Home; path: string }> = {
  CUSTOMER: { label: "Customer", icon: Sparkles, path: "/" },
  PARTNER: { label: "Dealer", icon: Warehouse, path: "/partner" },
  OPERATIONS: { label: "Customer Service", icon: Headphones, path: "/ops" },
  ADMIN: { label: "Admin", icon: Shield, path: "/admin" },
};

/* ===========================================================================
   ZONE STYLES
   =========================================================================== */

export function getZoneStyles(zone: Zone): {
  bg: string;
  text: string;
  accent: string;
} {
  const styles = {
    CUSTOMER: {
      bg: "bg-sky-500",
      text: "text-sky-600",
      accent: "ring-sky-500",
    },
    PARTNER: {
      bg: "bg-violet-500",
      text: "text-violet-600",
      accent: "ring-violet-500",
    },
    OPERATIONS: {
      bg: "bg-emerald-500",
      text: "text-emerald-600",
      accent: "ring-emerald-500",
    },
    ADMIN: {
      bg: "bg-amber-500",
      text: "text-amber-600",
      accent: "ring-amber-500",
    },
  };

  return styles[zone];
}

/* ===========================================================================
   NAVIGATION ITEM TYPES
   =========================================================================== */

export type NavItem = {
  label: string;
  path: string;
  icon: typeof Home;
  zone: Zone;
  requiredRoles: Role[];
  /** Secondary path for matching active state */
  matchPaths?: string[];
  /** Hide from sidebar, but still accessible */
  hidden?: boolean;
  /** Show badge with count */
  badge?: string | number;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

/* ===========================================================================
   CUSTOMER ZONE NAVIGATION
   =========================================================================== */

const customerZone: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        path: "/",
        icon: Home,
        zone: "CUSTOMER",
        requiredRoles: ["CUSTOMER"],
        matchPaths: ["/"],
      },
      {
        label: "My Products",
        path: "/products",
        icon: Boxes,
        zone: "CUSTOMER",
        requiredRoles: ["CUSTOMER"],
        matchPaths: ["/products", "/products/:id"],
      },
      {
        label: "My Tickets",
        path: "/tickets",
        icon: TicketCheck,
        zone: "CUSTOMER",
        requiredRoles: ["CUSTOMER"],
        matchPaths: ["/tickets", "/tickets/:id"],
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        label: "Support",
        path: "/support",
        icon: ClipboardPlus,
        zone: "CUSTOMER",
        requiredRoles: ["CUSTOMER"],
        matchPaths: ["/support", "/support/product", "/support/issue", "/support/media", "/support/review", "/support/success"],
      },
      {
        label: "My Warranties",
        path: "/warranties",
        icon: BadgeCheck,
        zone: "CUSTOMER",
        requiredRoles: ["CUSTOMER"],
        hidden: !isWarrantyModuleEnabled,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Settings",
        path: "/settings",
        icon: Settings,
        zone: "CUSTOMER",
        requiredRoles: ["CUSTOMER"],
        hidden: true,
      },
    ],
  },
];

/* ===========================================================================
   PARTNER ZONE NAVIGATION
   =========================================================================== */

const partnerZone: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        path: "/partner",
        icon: LayoutDashboard,
        zone: "PARTNER",
        requiredRoles: ["DEALER"],
      },
      {
        label: "Register Warranty",
        path: "/partner/register",
        icon: PackagePlus,
        zone: "PARTNER",
        requiredRoles: ["DEALER"],
        hidden: !isWarrantyModuleEnabled,
      },
      {
        label: "Products",
        path: "/partner/products",
        icon: Boxes,
        zone: "PARTNER",
        requiredRoles: ["DEALER"],
        matchPaths: ["/partner/products", "/partner/products/:id"],
      },
      {
        label: "Tickets",
        path: "/partner/tickets",
        icon: TicketCheck,
        zone: "PARTNER",
        requiredRoles: ["DEALER"],
        matchPaths: ["/partner/tickets", "/partner/tickets/:id", "/partner/tickets/new"],
      },
    ],
  },
  {
    title: "Service",
    items: [
      {
        label: "Replacement",
        path: "/partner/approvals",
        icon: PackageCheck,
        zone: "PARTNER",
        requiredRoles: ["DEALER"],
        badge: 3, // TODO:动态获取
      },
      {
        label: "Returns",
        path: "/partner/returns",
        icon: RotateCcw,
        zone: "PARTNER",
        requiredRoles: ["DEALER"],
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        label: "Reports",
        path: "/partner/stats",
        icon: FileBarChart,
        zone: "PARTNER",
        requiredRoles: ["DEALER"],
      },
    ],
  },
];

/* ===========================================================================
   OPERATIONS ZONE NAVIGATION
   =========================================================================== */

const operationsZone: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        path: "/ops",
        icon: LayoutDashboard,
        zone: "OPERATIONS",
        requiredRoles: ["CUSTOMER_SERVICE"],
      },
      {
        label: "My Tickets",
        path: "/ops/queue",
        icon: ListChecks,
        zone: "OPERATIONS",
        requiredRoles: ["CUSTOMER_SERVICE"],
        badge: 5, // TODO:动态获取
      },
      {
        label: "Unassigned Tickets",
        path: "/ops/team",
        icon: Users,
        zone: "OPERATIONS",
        requiredRoles: ["CUSTOMER_SERVICE"],
      },
    ],
  },
  {
    title: "Work",
    items: [
      {
        label: "Tickets",
        path: "/ops/tickets",
        icon: ClipboardList,
        zone: "OPERATIONS",
        requiredRoles: ["CUSTOMER_SERVICE"],
        matchPaths: ["/ops/tickets", "/ops/tickets/:id"],
      },
      {
        label: "Approvals",
        path: "/ops/approvals",
        icon: ClipboardCheck,
        zone: "OPERATIONS",
        requiredRoles: ["CUSTOMER_SERVICE"],
      },
      {
        label: "Escalations",
        path: "/ops/escalations",
        icon: Headphones,
        zone: "OPERATIONS",
        requiredRoles: ["CUSTOMER_SERVICE"],
      },
    ],
  },
  {
    title: "Customers",
    items: [
      {
        label: "Customer Lookup",
        path: "/ops/customers",
        icon: Search,
        zone: "OPERATIONS",
        requiredRoles: ["CUSTOMER_SERVICE"],
        matchPaths: ["/ops/customers", "/ops/customers/:id"],
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        label: "My Stats",
        path: "/ops/stats",
        icon: FileBarChart,
        zone: "OPERATIONS",
        requiredRoles: ["CUSTOMER_SERVICE"],
      },
    ],
  },
];

/* ===========================================================================
   ADMIN ZONE NAVIGATION
   =========================================================================== */

const adminZone: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
        zone: "ADMIN",
        requiredRoles: ["ADMIN"],
      },
      {
        label: "Escalations",
        path: "/admin/escalations",
        icon: Headphones,
        zone: "ADMIN",
        requiredRoles: ["ADMIN"],
        badge: 3, // TODO:动态获取
      },
      {
        label: "Overview",
        path: "/admin/overview",
        icon: Boxes,
        zone: "ADMIN",
        requiredRoles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Dealers",
        path: "/admin/dealers",
        icon: Warehouse,
        zone: "ADMIN",
        requiredRoles: ["ADMIN"],
        matchPaths: ["/admin/dealers", "/admin/dealers/new", "/admin/dealers/:id"],
      },
      {
        label: "Customers",
        path: "/admin/customers",
        icon: Users,
        zone: "ADMIN",
        requiredRoles: ["ADMIN"],
        matchPaths: ["/admin/customers", "/admin/customers/:id"],
      },
      {
        label: "Users",
        path: "/admin/users",
        icon: UserCheck,
        zone: "ADMIN",
        requiredRoles: ["ADMIN"],
        matchPaths: ["/admin/users", "/admin/users/new", "/admin/users/:id"],
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Audit Log",
        path: "/admin/audit",
        icon: FileBarChart,
        zone: "ADMIN",
        requiredRoles: ["ADMIN"],
      },
      {
        label: "Settings",
        path: "/admin/settings",
        icon: Settings,
        zone: "ADMIN",
        requiredRoles: ["ADMIN"],
      },
    ],
  },
];

/* ===========================================================================
   ALL NAVIGATION SECTIONS
   =========================================================================== */

export const navigationSections: Record<Zone, NavSection[]> = {
  CUSTOMER: customerZone,
  PARTNER: partnerZone,
  OPERATIONS: operationsZone,
  ADMIN: adminZone,
};

/* ===========================================================================
   HELPER FUNCTIONS
   =========================================================================== */

export function getNavigationForRole(role: Role): NavSection[] {
  const zone = roleToZone[role];
  return navigationSections[zone];
}

export function getZoneForRole(role: Role): Zone {
  return roleToZone[role];
}

export function isPathAccessible(path: string, role: Role): boolean {
  const sections = getNavigationForRole(role);

  for (const section of sections) {
    for (const item of section.items) {
      if (item.hidden) continue;

      // Exact match
      if (item.path === path) {
        return item.requiredRoles.includes(role);
      }

      // Match paths pattern
      if (item.matchPaths?.some((match) => {
        if (match.endsWith("*")) {
          return path.startsWith(match.slice(0, -1));
        }
        return path.startsWith(match);
      })) {
        return item.requiredRoles.includes(role);
      }
    }
  }

  return false;
}

export function findNavItem(path: string, role: Role): NavItem | undefined {
  const sections = getNavigationForRole(role);

  for (const section of sections) {
    for (const item of section.items) {
      if (item.path === path) return item;
      if (item.matchPaths?.some((match) => path.startsWith(match))) return item;
    }
  }

  return undefined;
}
