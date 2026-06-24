import { Injectable } from "@nestjs/common";
import { ODOO_MODELS } from "../odoo.constants";
import { OdooRequestAuth, OdooTicketRecord, OdooTicketStageRecord, OdooUserRecord } from "../odoo.types";
import { OdooClient } from "./odoo.client";

@Injectable()
export class OdooTicketService {
  constructor(private readonly odoo: OdooClient) {}

  findTickets(domain: unknown[] = [], auth?: OdooRequestAuth) {
    return this.odoo.searchRead<OdooTicketRecord>(
      ODOO_MODELS.TICKET,
      domain,
      {
        fields: [
          "id",
          "name",
          "partner_id",
          "partner_email",
          "partner_phone",
          "partner_name",
          "stage_id",
          "team_id",
          "priority",
          "description",
          "ticket_ref",
          "create_date",
          "user_id",
        ],
        order: "id desc",
      },
      auth,
    );
  }

  async findTicketById(ticketId: number, auth?: OdooRequestAuth) {
    const [ticket] = await this.odoo.searchRead<OdooTicketRecord>(
      ODOO_MODELS.TICKET,
      [["id", "=", ticketId]],
      {
        fields: [
          "id",
          "name",
          "partner_id",
          "partner_email",
          "partner_phone",
          "partner_name",
          "stage_id",
          "team_id",
          "priority",
          "description",
          "ticket_ref",
          "create_date",
          "user_id",
        ],
        limit: 1,
      },
      auth,
    );

    return ticket;
  }

  findTicketsBySerialNumber(serialNumber: string, auth?: OdooRequestAuth) {
    return this.findTickets(
      [
        "|",
        ["name", "ilike", serialNumber],
        ["description", "ilike", serialNumber],
      ],
      auth,
    );
  }

  createTicket(values: Record<string, unknown>, auth?: OdooRequestAuth) {
    return this.odoo.create<number>(ODOO_MODELS.TICKET, values, auth);
  }

  updateTicket(id: number, values: Record<string, unknown>, auth?: OdooRequestAuth) {
    return this.odoo.write(ODOO_MODELS.TICKET, [id], values, auth);
  }

  findStages(auth?: OdooRequestAuth) {
    return this.odoo.searchRead<OdooTicketStageRecord>(
      ODOO_MODELS.TICKET_STAGE,
      [],
      {
        fields: ["id", "name", "sequence", "fold", "team_ids"],
        order: "sequence asc, id asc",
      },
      auth,
    );
  }

  findUsersByIds(ids: number[], auth?: OdooRequestAuth) {
    if (!ids.length) {
      return Promise.resolve([] as OdooUserRecord[]);
    }

    return this.odoo.searchRead<OdooUserRecord>(
      ODOO_MODELS.USERS,
      [["id", "in", ids]],
      {
        fields: ["id", "login", "name", "email", "partner_id"],
      },
      auth,
    );
  }
}
