import { NavLink } from "react-router-dom";
import { Home, Boxes, TicketCheck, ClipboardPlus, Settings } from "lucide-react";
import { getZoneForRole, type Zone } from "./navigation";
import { useAuthService } from "../services/api/auth";
import { cn } from "../utils/cn";
import { isWarrantyModuleEnabled } from "../utils/releaseFlags";

/* ===========================================================================
   MOBILE NAVIGATION
   =========================================================================== */

/**
 * Mobile bottom tab navigation.
 * Shows zone-specific primary actions (max 4).
 */
export function MobileNav() {
  const { user } = useAuthService();

  if (!user?.role) {
    return null;
  }

  const zone = getZoneForRole(user.role);
  const items = getMobileNavItems(zone);

  if (!items.length) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-18px_36px_-28px_rgba(15,23,42,0.5)] backdrop-blur md:hidden"
      aria-label="Mobile primary"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-col items-center justify-center rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 transition",
                  isActive && "bg-sky-50 text-primary",
                )
              }
            >
              <Icon className="mb-1 h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

/* ===========================================================================
   ZONE-SPECIFIC MOBILE NAV ITEMS
   =========================================================================== */

type MobileNavItem = {
  label: string;
  path: string;
  icon: typeof Home;
};

function getMobileNavItems(zone: Zone): MobileNavItem[] {
  const mobileNavMap: Record<Zone, MobileNavItem[]> = {
    CUSTOMER: [
      { label: "Dashboard", path: "/", icon: Home },
      { label: "Products", path: "/products", icon: Boxes },
      { label: "Tickets", path: "/tickets", icon: TicketCheck },
      { label: "Support", path: "/support", icon: ClipboardPlus },
    ],
    PARTNER: [
      { label: "Dashboard", path: "/partner", icon: Home },
      ...(isWarrantyModuleEnabled ? [{ label: "Warranty", path: "/partner/register", icon: ClipboardPlus }] : []),
      { label: "Products", path: "/partner/products", icon: Boxes },
      { label: "Tickets", path: "/partner/tickets", icon: TicketCheck },
    ],
    OPERATIONS: [
      { label: "My Tickets", path: "/ops/queue", icon: Home },
      { label: "Tickets", path: "/ops/tickets", icon: TicketCheck },
      { label: "Approvals", path: "/ops/approvals", icon: ClipboardPlus },
      { label: "Search", path: "/ops/customers", icon: Boxes },
    ],
    ADMIN: [
      { label: "Dashboard", path: "/admin", icon: Home },
      { label: "Escalations", path: "/admin/escalations", icon: TicketCheck },
      { label: "Dealers", path: "/admin/dealers", icon: Boxes },
      { label: "Settings", path: "/admin/settings", icon: Settings },
    ],
  };

  return mobileNavMap[zone];
}
