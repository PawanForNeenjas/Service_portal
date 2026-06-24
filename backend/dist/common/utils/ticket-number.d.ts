export type TicketNumberProduct = {
    brandCode: string;
    modelCode: string;
};
export type TicketNumberRecord = {
    ticketNumber?: string;
};
export declare function generateTicketNumber(product: TicketNumberProduct, existingTickets: TicketNumberRecord[], date?: Date): string;
