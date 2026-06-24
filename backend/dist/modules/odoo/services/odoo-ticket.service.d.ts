import { OdooRequestAuth, OdooTicketRecord, OdooTicketStageRecord, OdooUserRecord } from "../odoo.types";
import { OdooClient } from "./odoo.client";
export declare class OdooTicketService {
    private readonly odoo;
    constructor(odoo: OdooClient);
    findTickets(domain?: unknown[], auth?: OdooRequestAuth): Promise<OdooTicketRecord[]>;
    findTicketById(ticketId: number, auth?: OdooRequestAuth): Promise<OdooTicketRecord>;
    findTicketsBySerialNumber(serialNumber: string, auth?: OdooRequestAuth): Promise<OdooTicketRecord[]>;
    createTicket(values: Record<string, unknown>, auth?: OdooRequestAuth): Promise<number>;
    updateTicket(id: number, values: Record<string, unknown>, auth?: OdooRequestAuth): Promise<boolean>;
    findStages(auth?: OdooRequestAuth): Promise<OdooTicketStageRecord[]>;
    findUsersByIds(ids: number[], auth?: OdooRequestAuth): Promise<OdooUserRecord[]>;
}
