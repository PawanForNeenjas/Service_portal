import type { Role } from "../types";
import { isWarrantyModuleEnabled } from "../utils/releaseFlags";

export const roleLabels: Record<Role, string> = {
  CUSTOMER: "Customer",
  DEALER: "Dealer",
  CUSTOMER_SERVICE: "Customer Service",
  ADMIN: "Admin",
};

export const roleHomePath: Record<Role, string> = {
  CUSTOMER: "/",
  DEALER: "/partner",
  CUSTOMER_SERVICE: "/ops",
  ADMIN: "/admin",
};

export const routePermissions: Record<string, Role[]> = {
  "/": ["CUSTOMER"],
  "/products": ["CUSTOMER"],
  "/tickets": ["CUSTOMER"],
  "/support": ["CUSTOMER"],
  "/support/success": ["CUSTOMER"],
  ...(isWarrantyModuleEnabled ? { "/warranties": ["CUSTOMER"] as Role[] } : {}),
  "/settings": ["CUSTOMER"],
  "/partner": ["DEALER"],
  ...(isWarrantyModuleEnabled ? { "/partner/register": ["DEALER"] as Role[] } : {}),
  "/partner/products": ["DEALER"],
  "/partner/tickets": ["DEALER"],
  "/partner/approvals": ["DEALER"],
  "/partner/returns": ["DEALER"],
  "/partner/stats": ["DEALER"],
  "/ops": ["CUSTOMER_SERVICE"],
  "/ops/queue": ["CUSTOMER_SERVICE"],
  "/ops/team": ["CUSTOMER_SERVICE"],
  "/ops/tickets": ["CUSTOMER_SERVICE"],
  "/ops/approvals": ["CUSTOMER_SERVICE"],
  "/ops/escalations": ["CUSTOMER_SERVICE"],
  "/ops/customers": ["CUSTOMER_SERVICE"],
  "/ops/stats": ["CUSTOMER_SERVICE"],
  "/admin": ["ADMIN"],
  "/admin/escalations": ["ADMIN"],
  "/admin/overview": ["ADMIN"],
  "/admin/dealers": ["ADMIN"],
  "/admin/customers": ["ADMIN"],
  "/admin/users": ["ADMIN"],
  "/admin/audit": ["ADMIN"],
  "/admin/settings": ["ADMIN"],
};

export function canAccessRoute(role: Role, path: string) {
  if (path === "/login" || path === "/403") {
    return true;
  }

  if (path.startsWith("/products/")) {
    return ["CUSTOMER", "DEALER", "CUSTOMER_SERVICE", "ADMIN"].includes(role);
  }

  if (path.startsWith("/tickets/")) {
    return ["CUSTOMER", "DEALER", "CUSTOMER_SERVICE", "ADMIN"].includes(role);
  }

  if (path.startsWith("/support/")) {
    return routePermissions["/support/success"].includes(role);
  }

  if (path.startsWith("/partner/customers")) {
    return false;
  }

  if (!isWarrantyModuleEnabled && (path === "/warranties" || path.startsWith("/partner/register"))) {
    return false;
  }

  if (path.startsWith("/partner/")) {
    return role === "DEALER";
  }

  if (path.startsWith("/ops/tickets/")) {
    return role === "CUSTOMER_SERVICE";
  }

  if (path.startsWith("/ops/")) {
    return role === "CUSTOMER_SERVICE";
  }

  if (path.startsWith("/admin/")) {
    return role === "ADMIN";
  }

  return routePermissions[path]?.includes(role) ?? false;
}
