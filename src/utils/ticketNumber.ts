import type { Product, Ticket } from "../types/domain";

const TICKET_NUMBER_PATTERN = /^([A-Z0-9]+)-([A-Z0-9]+)-(\d{8})-(\d{3})$/;

/* ===========================================================================
   TICKET NUMBER GENERATOR
   =========================================================================== */

/**
 * Generates ticket number in format: BRAND-MODEL-YYYYMMDD-SEQ
 * Example: EU-330-20260617-001
 *
 * BRAND:
 * - EU = Euler
 * - LV = Livguard
 *
 * MODEL:
 * - 330 = 3.3kW charger
 * - 740 = 7.4kW charger
 */

export function generateTicketNumber(product: Product, existingTickets: Ticket[]) {
  const dateStamp = formatLocalDateStamp(new Date());
  const prefix = `${product.brandCode}-${product.modelCode}-${dateStamp}`;
  const usedSequences = new Set<number>();

  // Find sequences already used for this brand/model/date
  for (const ticket of existingTickets) {
    const match = TICKET_NUMBER_PATTERN.exec(ticket.ticketNumber);
    if (!match) continue;

    const [, brandCode, modelCode, ticketDate, sequence] = match;
    if (brandCode === product.brandCode && modelCode === product.modelCode && ticketDate === dateStamp) {
      usedSequences.add(Number(sequence));
    }
  }

  // Find next available sequence
  let nextSequence = 1;
  while (usedSequences.has(nextSequence)) {
    nextSequence += 1;
  }

  return `${prefix}-${String(nextSequence).padStart(3, "0")}`;
}

/* ===========================================================================
   TICKET NUMBER PARSER
   =========================================================================== */

export function parseTicketNumber(ticketNumber: string): {
  brand: string;
  model: string;
  date: string;
  sequence: string;
} | null {
  const match = TICKET_NUMBER_PATTERN.exec(ticketNumber);
  if (!match) return null;

  return {
    brand: match[1],
    model: match[2],
    date: match[3],
    sequence: match[4],
  };
}

function formatLocalDateStamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/* ===========================================================================
   PRODUCT BRAND/MODEL HELPERS
   =========================================================================== */

export const BRAND_LABELS: Record<string, string> = {
  EU: "Euler",
  LV: "Livguard",
  DEFAULT: "Neenjas",
};

export const MODEL_LABELS: Record<string, string> = {
  "330": "3.3kW Charger",
  "740": "7.4kW Charger",
  "1000": "10kW Charger",
  LED: "LED Panel",
  INV: "Inverter",
};

export function getProductDisplayName(brandCode: string, modelCode: string): string {
  const brand = BRAND_LABELS[brandCode] ?? BRAND_LABELS.DEFAULT;
  const model = MODEL_LABELS[modelCode] ?? modelCode;
  return `${brand} ${model}`;
}

/* ===========================================================================
   WARRANTY STATUS HELPERS
   =========================================================================== */

export type WarrantyStatusDisplay = "ACTIVE" | "EXPIRED" | "EXPIRING_SOON" | "NONE" | "UNREGISTERED";

export function checkWarrantyStatus(warrantyEndDate: string | null | undefined): WarrantyStatusDisplay {
  if (!warrantyEndDate) return "UNREGISTERED";

  const endDate = new Date(warrantyEndDate);
  const today = new Date();
  const daysUntilExpiry = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return "EXPIRED";
  if (daysUntilExpiry <= 30) return "EXPIRING_SOON";
  return "ACTIVE";
}

export function getWarrantyDisplayInfo(status: WarrantyStatusDisplay): {
  LABEL: string;
  TONE: "success" | "warning" | "error" | "default";
} {
  const statusMap: Record<WarrantyStatusDisplay, { LABEL: string; TONE: "success" | "warning" | "error" | "default" }> = {
    ACTIVE: { LABEL: "Active", TONE: "success" },
    EXPIRING_SOON: { LABEL: "Expiring Soon", TONE: "warning" },
    EXPIRED: { LABEL: "Expired", TONE: "error" },
    NONE: { LABEL: "Not Registered", TONE: "default" },
    UNREGISTERED: { LABEL: "Unregistered", TONE: "default" },
  };
  return statusMap[status];
}

/* ===========================================================================
   TICKET STATUS MAPPING
   =========================================================================== */

/**
 * Internal (ERP) to Customer-facing status mapping
 * Never expose internal ERP terminology to customers
 */

export const TICKET_STATUS_INTERNAL: Record<string, string> = {
  OPEN: "Complaint Received",
  UNDER_REVIEW: "Engineer Reviewing",
  IN_SERVICE: "Service In Progress",
  REPLACEMENT_APPROVED: "Replacement Approved",
  REPLACEMENT_DISPATCHED: "Replacement Shipped",
  RESOLVED: "Issue Resolved",
  CLOSED: "Closed",
};

export function getCustomerFacingTicketStatus(internalStatus: string): string {
  return TICKET_STATUS_INTERNAL[internalStatus] ?? internalStatus;
}

/* ===========================================================================
   ROLE PERMISSIONS
   =========================================================================== */

export function canCustomerCreateTicket(role: string | undefined): boolean {
  return role === "CUSTOMER";
}

export function canDealerCreateTicket(role: string | undefined): boolean {
  return role === "DEALER";
}

export function canUpdateTicketStatus(role: string | undefined): boolean {
  return role === "CUSTOMER_SERVICE" || role === "ADMIN";
}

export function canApproveReplacement(role: string | undefined): boolean {
  // Only Customer Service and Admin can approve replacements
  // Dealers CANNOT approve replacements
  return role === "CUSTOMER_SERVICE" || role === "ADMIN";
}

export function canRegisterWarranty(role: string | undefined): boolean {
  // Only Dealers and Admin can register warranty
  // Customers CANNOT register warranty themselves
  return role === "DEALER" || role === "ADMIN";
}