import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthService } from "../services/api/auth";
import { roleToZone, type Zone } from "../layouts/navigation";
import type { Role } from "../types";

type ProtectedRouteProps = {
  /** Optional: explicitly specify allowed roles */
  allowedRoles?: Role[];
  /** Children to render if access is granted */
  children: ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const location = useLocation();
  const { authLoading, getHomePath, isAuthenticated, hasRole, user } = useAuthService();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm font-medium text-slate-500">
        Validating session...
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // If no roles specified, just verify authentication
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has one of the allowed roles
  if (!hasRole(allowedRoles)) {
    if (user?.role) {
      return <Navigate to={getHomePath(user.role)} replace state={{ from: location }} />;
    }

    // Fallback - go to login (will redirect to appropriate dashboard)
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/* ===========================================================================
   ROUTE GUARD HOOK
   =========================================================================== */

/**
 * Hook to check if current user can access a specific route.
 * Useful for conditionally rendering UI elements.
 */
export function useRouteAccess() {
  const { hasRole, user } = useAuthService();

  return {
    /** Check if user has any of the specified roles */
    hasRoles: (roles: Role[]): boolean => {
      if (!roles.length) return true;
      return hasRole(roles);
    },
    /** Get user's current zone */
    getCurrentZone: (): Zone | null => {
      return user?.role ? roleToZone[user.role] : null;
    },
    /** Check if user is in a specific zone */
    isInZone: (zone: Zone): boolean => {
      return user?.role ? roleToZone[user.role] === zone : false;
    },
  };
}
