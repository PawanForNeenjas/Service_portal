import type { AuthUser } from "../../types";
import type { DomainState, Product, Replacement, ReturnShipment, Ticket, Warranty } from "../../types/domain";

export function getVisibleProducts(products: Product[], user: AuthUser | null) {
  if (!user) {
    return [];
  }

  if (user.role === "ADMIN" || user.role === "CUSTOMER_SERVICE") {
    return products;
  }

  if (user.role === "DEALER") {
    return products.filter((product) => product.dealerId === user.dealerId);
  }

  return products.filter((product) => product.customerId === user.customerId);
}

export function getVisibleTickets(tickets: Ticket[], products: Product[], user: AuthUser | null) {
  if (!user) {
    return [];
  }

  if (user.role === "ADMIN" || user.role === "CUSTOMER_SERVICE") {
    return tickets;
  }

  if (user.role === "DEALER") {
    const visibleProductIds = new Set(getVisibleProducts(products, user).map((product) => product.id));
    return tickets.filter((ticket) => visibleProductIds.has(ticket.productId));
  }

  return tickets.filter((ticket) => ticket.customerId === user.customerId);
}

export function getVisibleWarranties(warranties: Warranty[], products: Product[], user: AuthUser | null) {
  if (!user) {
    return [];
  }

  if (user.role === "ADMIN" || user.role === "CUSTOMER_SERVICE") {
    return warranties;
  }

  if (user.role === "DEALER") {
    const visibleProductIds = new Set(getVisibleProducts(products, user).map((product) => product.id));
    return warranties.filter((warranty) => visibleProductIds.has(warranty.productId));
  }

  return warranties.filter((warranty) => warranty.customerId === user.customerId);
}

export function getVisibleReplacements(
  replacements: Replacement[],
  tickets: Ticket[],
  products: Product[],
  user: AuthUser | null,
) {
  const visibleTicketIds = new Set(getVisibleTickets(tickets, products, user).map((ticket) => ticket.id));
  return replacements.filter((replacement) => visibleTicketIds.has(replacement.ticketId));
}

export function getVisibleReturns(
  returns: ReturnShipment[],
  replacements: Replacement[],
  tickets: Ticket[],
  products: Product[],
  user: AuthUser | null,
) {
  const visibleReplacementIds = new Set(getVisibleReplacements(replacements, tickets, products, user).map((replacement) => replacement.id));
  return returns.filter((shipment) => visibleReplacementIds.has(shipment.replacementId));
}

export function canCreateWarranty(user: AuthUser | null) {
  return user?.role === "DEALER" || user?.role === "ADMIN";
}

export function canCreateTicketForProduct(product: Product | undefined, user: AuthUser | null) {
  if (!product || !user) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  if (user.role === "DEALER") {
    return product.dealerId === user.dealerId;
  }

  if (user.role === "CUSTOMER") {
    return product.customerId === user.customerId;
  }

  return false;
}

export function canViewProduct(product: Product | undefined, user: AuthUser | null) {
  if (!product || !user) {
    return false;
  }

  return getVisibleProducts([product], user).length === 1;
}

export function canViewTicket(ticket: Ticket | undefined, state: DomainState, user: AuthUser | null) {
  if (!ticket || !user) {
    return false;
  }

  return getVisibleTickets([ticket], state.products, user).length === 1;
}
