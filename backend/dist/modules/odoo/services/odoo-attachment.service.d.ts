import { OdooAttachmentRecord, OdooRequestAuth } from "../odoo.types";
import { OdooClient } from "./odoo.client";
type CreateTicketAttachmentInput = {
    name: string;
    datas: string;
    mimetype: string;
};
export declare class OdooAttachmentService {
    private readonly odoo;
    constructor(odoo: OdooClient);
    listTicketAttachments(ticketId: number, auth?: OdooRequestAuth): Promise<OdooAttachmentRecord[]>;
    findTicketAttachmentById(ticketId: number, attachmentId: number, auth?: OdooRequestAuth): Promise<OdooAttachmentRecord>;
    createTicketAttachment(ticketId: number, input: CreateTicketAttachmentInput, auth?: OdooRequestAuth): Promise<number>;
}
export {};
