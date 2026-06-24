export type TicketNumberProduct = {
  brandCode: string;
  modelCode: string;
};

export type TicketNumberRecord = {
  ticketNumber?: string;
};

export function generateTicketNumber(product: TicketNumberProduct, existingTickets: TicketNumberRecord[], date = new Date()) {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const datePart = `${yyyy}${mm}${dd}`;
  const prefix = `${product.brandCode}-${product.modelCode}-${datePart}`;

  const maxSequence = existingTickets.reduce((max, ticket) => {
    if (!ticket.ticketNumber?.startsWith(prefix)) {
      return max;
    }

    const sequence = Number(ticket.ticketNumber.slice(prefix.length + 1));
    return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
  }, 0);

  return `${prefix}-${String(maxSequence + 1).padStart(3, "0")}`;
}
