import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { roleToZone, zoneConfig } from "../layouts/navigation";
import { apiRequest, clearStoredAccessToken, getStoredAccessToken, setStoredAccessToken } from "../services/api/client";
import type { AuthUser, Role } from "../types";
import type { AuthUserDto } from "../types/dto";

const USER_STORAGE_KEY = "neenjas.auth.user";

/* ===========================================================================
   AUTH CONTEXT TYPES
   =========================================================================== */

type AuthContextValue = {
  authUser: AuthUserDto | null;
  user: AuthUser | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  login: (login: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  hasRole: (roles?: Role[]) => boolean;
  getHomePath: (role?: Role) => string;
  getZonePath: () => string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* ===========================================================================
   AUTH PROVIDER
   =========================================================================== */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUserDto | null>(() => (getStoredAccessToken() ? readStoredAuthUser() : null));
  const [token, setToken] = useState<string | null>(() => getStoredAccessToken());
  const [authLoading, setAuthLoading] = useState(Boolean(getStoredAccessToken()));
  const skipNextHydrationRef = useRef(false);
  const user = useMemo(() => (authUser ? buildSessionUser(authUser) : null), [authUser]);

  // Persist raw backend auth user to localStorage
  useEffect(() => {
    if (authUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [authUser]);

  useEffect(() => {
    if (!token) {
      setAuthUser(null);
      setAuthLoading(false);
      return;
    }

    if (skipNextHydrationRef.current) {
      skipNextHydrationRef.current = false;
      setAuthLoading(false);
      return;
    }

    let active = true;
    setAuthLoading(true);

    fetchCurrentUser()
      .then((nextAuthUser) => {
        if (!active) {
          return;
        }

        setAuthUser(nextAuthUser);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        clearStoredAccessToken();
        setToken(null);
        setAuthUser(null);
      })
      .finally(() => {
        if (active) {
          setAuthLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const completeLogin = useCallback(
    async (payload: { login: string; password: string }) => {
      setAuthLoading(true);

      try {
        const result = await apiRequest<{ accessToken: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setStoredAccessToken(result.accessToken);
        const nextAuthUser = await fetchCurrentUser();
        skipNextHydrationRef.current = true;
        setAuthUser(nextAuthUser);
        setToken(result.accessToken);
        setAuthLoading(false);
        return buildSessionUser(nextAuthUser);
      } catch (error) {
        clearStoredAccessToken();
        setToken(null);
        setAuthUser(null);
        setAuthLoading(false);
        throw error;
      }
    },
    [],
  );

  const login = useCallback(async (loginId: string, password: string) => {
    return completeLogin({
      login: loginId,
      password,
    });
  }, [completeLogin]);

  // Logout
  const logout = useCallback(() => {
    clearStoredAccessToken();
    setToken(null);
    setAuthUser(null);
    setAuthLoading(false);
  }, []);

  // Check if user has specific role(s)
  const hasRole = useCallback(
    (roles?: Role[]) => {
      if (!roles?.length) {
        return Boolean(user);
      }
      return user ? roles.includes(user.role) : false;
    },
    [user],
  );

  // Get home path for a role (zone-based)
  const getHomePath = useCallback(
    (role?: Role) => {
      const targetRole = role ?? user?.role ?? "CUSTOMER";
      const zone = roleToZone[targetRole];
      return zoneConfig[zone]?.path ?? "/";
    },
    [user?.role],
  );

  // Get zone path for current user
  const getZonePath = useCallback(() => {
    if (!user) return "/login";
    const zone = roleToZone[user.role];
    return zoneConfig[zone]?.path ?? "/";
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      authUser,
      user,
      authLoading,
      isAuthenticated: Boolean(authUser && token),
      login,
      logout,
      hasRole,
      getHomePath,
      getZonePath,
    }),
    [authLoading, authUser, user, token, login, logout, hasRole, getHomePath, getZonePath],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ===========================================================================
   HOOK
   =========================================================================== */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

/* ===========================================================================
   STORAGE HELPERS
   =========================================================================== */

async function fetchCurrentUser() {
  return apiRequest<AuthUserDto>("/auth/me");
}

function readStoredAuthUser(): AuthUserDto | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (isAuthUserDto(parsed)) {
      return parsed;
    }

    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function isAuthUserDto(value: unknown): value is AuthUserDto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuthUserDto>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.login === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.phone === "string" &&
    typeof candidate.role === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.odooUid === "number"
  );
}

function buildSessionUser(authUser: AuthUserDto): AuthUser {
  return {
    ...authUser,
    email: authUser.email ?? "",
    phone: authUser.phone,
    mobile: authUser.phone,
    avatarInitials: getInitials(authUser.name || authUser.login),
  };
}

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
