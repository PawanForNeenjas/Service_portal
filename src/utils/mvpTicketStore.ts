import type { PortalTrackedTicketRef } from "../types/dto";
import type { AuthUser } from "../types";

const LEGACY_STORAGE_KEY = "neenjas.mvp.ticketRefs";

type TicketStoreScope = Pick<AuthUser, "id" | "partnerId"> | null | undefined;

export function listTrackedTickets(scope?: TicketStoreScope) {
  return readStore(scope);
}

export function listTrackedTicketsForProduct(productId: string, scope?: TicketStoreScope) {
  return readStore(scope).filter((ticket) => ticket.productId === productId);
}

export function storeTrackedTicket(ticket: PortalTrackedTicketRef, scope?: TicketStoreScope) {
  const current = readStore(scope).filter((item) => item.id !== ticket.id);
  const next = [ticket, ...current].slice(0, 20);
  localStorage.setItem(getStorageKey(scope), JSON.stringify(next));
  return next;
}

function readStore(scope?: TicketStoreScope) {
  const storageKey = getStorageKey(scope);

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return readLegacyStore(scope);
    }

    const parsed = JSON.parse(raw) as PortalTrackedTicketRef[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(storageKey);
    return readLegacyStore(scope);
  }
}

function readLegacyStore(scope?: TicketStoreScope) {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      return [] as PortalTrackedTicketRef[];
    }

    const parsed = JSON.parse(raw) as PortalTrackedTicketRef[];
    if (!Array.isArray(parsed)) {
      return [] as PortalTrackedTicketRef[];
    }

    if (scope) {
      localStorage.setItem(getStorageKey(scope), JSON.stringify(parsed));
    }

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return [] as PortalTrackedTicketRef[];
  }
}

function getStorageKey(scope?: TicketStoreScope) {
  if (scope?.partnerId) {
    return `${LEGACY_STORAGE_KEY}.partner-${scope.partnerId}`;
  }

  if (scope?.id) {
    return `${LEGACY_STORAGE_KEY}.user-${scope.id}`;
  }

  return `${LEGACY_STORAGE_KEY}.anonymous`;
}
