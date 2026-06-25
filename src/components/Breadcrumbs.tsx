import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { findNavItem } from "../layouts/navigation";
import { useAuthService } from "../services/api/auth";

export function Breadcrumbs() {
  const location = useLocation();
  const { user, getZonePath } = useAuthService();
  const path = location.pathname;

  // Find the navigation item for this path
  const navItem = user?.role ? findNavItem(path, user.role) : null;
  const label = navItem?.label ?? (path === "/" ? "Dashboard" : path.split("/").pop() ?? "Dashboard");

  return (
    <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
      <Link
        to={getZonePath()}
        className="inline-flex items-center gap-1 rounded-md font-medium transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        Neenjas Sarthi
      </Link>
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
      <span className="font-semibold text-slate-900">{label}</span>
    </nav>
  );
}
