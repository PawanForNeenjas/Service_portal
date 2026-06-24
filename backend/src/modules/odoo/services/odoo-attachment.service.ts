import { Injectable } from "@nestjs/common";
import { ODOO_MODELS } from "../odoo.constants";
import { OdooAttachmentRecord, OdooRequestAuth } from "../odoo.types";
import { OdooClient } from "./odoo.client";

type CreateTicketAttachmentInput = {
  name: string;
  datas: string;
  mimetype: string;
};

@Injectable()
export class OdooAttachmentService {
  constructor(private readonly odoo: OdooClient) {}

  listTicketAttachments(ticketId: number, auth?: OdooRequestAuth) {
    return this.odoo.searchRead<OdooAttachmentRecord>(
      ODOO_MODELS.ATTACHMENT,
      [
        ["res_model", "=", ODOO_MODELS.TICKET],
        ["res_id", "=", ticketId],
      ],
      {
        fields: ["id", "name", "mimetype", "create_date", "res_model", "res_id"],
        order: "id asc",
      },
      auth,
    );
  }

  async findTicketAttachmentById(ticketId: number, attachmentId: number, auth?: OdooRequestAuth) {
    const [attachment] = await this.odoo.searchRead<OdooAttachmentRecord>(
      ODOO_MODELS.ATTACHMENT,
      [
        ["id", "=", attachmentId],
        ["res_model", "=", ODOO_MODELS.TICKET],
        ["res_id", "=", ticketId],
      ],
      {
        fields: ["id", "name", "mimetype", "create_date", "datas", "res_model", "res_id"],
        limit: 1,
      },
      auth,
    );

    return attachment;
  }

  createTicketAttachment(ticketId: number, input: CreateTicketAttachmentInput, auth?: OdooRequestAuth) {
    return this.odoo.create<number>(
      ODOO_MODELS.ATTACHMENT,
      {
        name: input.name,
        datas: input.datas,
        mimetype: input.mimetype,
        res_model: ODOO_MODELS.TICKET,
        res_id: ticketId,
      },
      auth,
    );
  }
}
