import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { getNavigationForRole, getZoneForRole, zoneConfig, type Zone, type NavSection, type NavItem } from "./navigation";
import { useAuthService } from "../services/api/auth";
import { cn } from "../utils/cn";

/* ===========================================================================
   SIDEBAR COMPONENT
   =========================================================================== */

/**
 * Zone-aware sidebar navigation.
 * Adapts content and styling based on the user's role/zone.
 */
export function AppSidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuthService();
  const role = user?.role;

  if (!role) {
    return null;
  }

  const zone = getZoneForRole(role);
  const zoneInfo = zoneConfig[zone];
  const sections = getNavigationForRole(role);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-24 flex-col bg-sidebar text-white md:flex xl:w-72">
      {/* Logo / Zone Header */}
      <div className="flex h-20 items-center gap-3 px-5 xl:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <zoneInfo.icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="hidden min-w-0 xl:block">
          <p className="text-sm font-semibold leading-tight">Neenjas Sarthi</p>
          <p className="text-xs text-slate-400">{zoneInfo.label}</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-6 px-3 xl:px-4" aria-label="Primary">
        {sections.map((section, sectionIndex) => (
          <SidebarSection key={section.title || sectionIndex} section={section} />
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="px-3 pb-5 xl:px-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-11 items-center justify-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.08] hover:text-white xl:justify-start"
          title="Sign out"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="hidden xl:inline">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

/* ===========================================================================
   SIDEBAR SECTION
   =========================================================================== */

function SidebarSection({ section }: { section: NavSection }) {
  return (
    <div className="space-y-1">
      {section.title && (
        <h3 className="hidden px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 xl:block">
          {section.title}
        </h3>
      )}
      <div className="space-y-1">
        {section.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <SidebarItem key={item.path} item={item} />
          ))}
      </div>
    </div>
  );
}

/* ===========================================================================
   SIDEBAR ITEM
   =========================================================================== */

function SidebarItem({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          "group flex h-11 items-center justify-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.08] hover:text-white xl:justify-start",
          isActive && "bg-white text-sidebar shadow-sm hover:bg-white hover:text-sidebar",
        )
      }
      title={item.label}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="hidden xl:inline">{item.label}</span>
      {item.badge !== undefined && (
        <span className="ml-auto hidden bg-primary px-1.5 py-0.5 text-xs font-semibold text-white xl:block">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

/* ===========================================================================
   ZONE INDICATOR (for header)
   =========================================================================== */

/**
 * Get zone-specific colors for visual distinction
 */
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
