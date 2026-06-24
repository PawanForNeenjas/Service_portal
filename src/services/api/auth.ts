import { useAuth } from "../../contexts/AuthContext";
import { useDomainData } from "../../contexts/DomainDataContext";
import type { ForgotPasswordDto, SignupCustomerDto } from "../../types/dto";
import { apiRequest } from "./client";
import { getVisibleProducts, getVisibleTickets } from "./access";
import { isWarrantyModuleEnabled } from "../../utils/releaseFlags";

export function useAuthService() {
  const auth = useAuth();
  const { state, markNotificationsRead } = useDomainData();
  const visibleProductIds = new Set(getVisibleProducts(state.products, auth.user).map((product) => product.id));
  const visibleTicketIds = new Set(getVisibleTickets(state.tickets, state.products, auth.user).map((ticket) => ticket.id));
  const notifications = state.notifications.filter((notification) => {
    if (!isWarrantyModuleEnabled && notification.title.toLowerCase().includes("warranty")) {
      return false;
    }

    if (!notification.path || auth.user?.role === "ADMIN" || auth.user?.role === "CUSTOMER_SERVICE") {
      return true;
    }

    if (notification.path.startsWith("/products/")) {
      return visibleProductIds.has(notification.path.replace("/products/", ""));
    }

    if (notification.path.startsWith("/tickets/")) {
      return visibleTicketIds.has(notification.path.replace("/tickets/", ""));
    }

    return true;
  });

  return {
    ...auth,
    users: state.users,
    notifications,
    markNotificationsRead,
  };
}

export function signupCustomer(payload: SignupCustomerDto) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(payload: ForgotPasswordDto) {
  return apiRequest<{ accepted: boolean }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
