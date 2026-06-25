import { useState } from "react";
import { NavLink, useLocation, useNavigate, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { getNavigationForRole, getZoneForRole, zoneConfig, getZoneStyles } from "./navigation";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { GlobalSearch } from "../components/GlobalSearch";
import { NotificationCenter } from "../components/NotificationCenter";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { roleLabels } from "../data/authData";
import { useAuthService } from "../services/api/auth";
import { cn } from "../utils/cn";

/* ===========================================================================
   APP LAYOUT
   =========================================================================== */

/**
 * Main application layout with zone-aware sidebar and header.
 */
export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const { logout, user } = useAuthService();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role;
  const zone = role ? getZoneForRole(role) : null;
  const zoneInfo = zone ? zoneConfig[zone] : null;
  const zoneStyles = zone ? getZoneStyles(zone) : null;
  const sections = role ? getNavigationForRole(role) : [];

  function handleLogout() {
    logout();
    setMobileMenuOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <AppSidebar />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur md:ml-24 xl:ml-72">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-white">
              {zoneInfo ? (
                <zoneInfo.icon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Neenjas Sarthi</p>
              <p className="text-xs text-slate-500">
                {zoneInfo?.label ?? "Neenjas Sarthi"}
              </p>
            </div>
          </div>

          {/* Desktop Header Content */}
          <div className="hidden min-w-0 flex-1 items-center gap-6 md:flex">
            <div className="shrink-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-950">Neenjas Sarthi</p>
                {zoneStyles && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium text-white",
                      zoneStyles.bg,
                    )}
                  >
                    {zoneInfo?.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {user ? roleLabels[user.role] : "Neenjas Sarthi"}
              </p>
            </div>
            <GlobalSearch />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <GlobalSearch compact className="md:hidden" />
            <NotificationCenter />
            {user ? (
              <div className="hidden items-center gap-3 rounded-lg border bg-white px-3 py-2 shadow-sm sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar text-xs font-semibold text-white">
                  {user.avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-5 text-slate-950">{user.name}</p>
                  <Badge tone={user.role === "ADMIN" ? "primary" : "default"}>{roleLabels[user.role]}</Badge>
                </div>
              </div>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-28 pt-6 sm:px-6 md:ml-24 md:pb-10 lg:px-8 xl:ml-72">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs />
        </div>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`${location.pathname}${location.search}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="mx-auto max-w-7xl"
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/50"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="absolute inset-y-0 left-0 flex w-[84vw] max-w-80 flex-col bg-sidebar p-4 text-white shadow-soft"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    {zoneInfo ? (
                      <zoneInfo.icon className="h-5 w-5" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Neenjas Sarthi</p>
                    <p className="text-xs text-slate-400">{zoneInfo?.label}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/[0.08]"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Info */}
              {user && (
                <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-sidebar">
                      {user.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{roleLabels[user.role]}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="mt-8 space-y-6" aria-label="Mobile menu">
                {sections.map((section, index) => (
                  <div key={section.title || index}>
                    {section.title && (
                      <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {section.title}
                      </h3>
                    )}
                    <div className="space-y-1">
                      {section.items
                        .filter((item) => !item.hidden)
                        .map((item) => {
                          const Icon = item.icon;
                          return (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={({ isActive }) =>
                                cn(
                                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.08] hover:text-white",
                                  isActive && "bg-white text-sidebar hover:bg-white hover:text-sidebar",
                                )
                              }
                            >
                              <Icon className="h-5 w-5" />
                              {item.label}
                            </NavLink>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Sign Out */}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-auto flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </button>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
