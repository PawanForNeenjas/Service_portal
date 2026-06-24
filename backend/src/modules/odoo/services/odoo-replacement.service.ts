import { Injectable } from "@nestjs/common";
import { ODOO_MODELS } from "../odoo.constants";
import { OdooRequestAuth } from "../odoo.types";
import { OdooClient } from "./odoo.client";

@Injectable()
export class OdooReplacementService {
  constructor(private readonly odoo: OdooClient) {}

  findReplacements(domain: unknown[] = [], auth?: OdooRequestAuth) {
    return this.odoo.searchRead<Record<string, unknown>>(
      ODOO_MODELS.PICKING,
      domain,
      {
        fields: ["id", "name", "origin", "partner_id", "state", "picking_type_id", "x_portal_status", "x_helpdesk_ticket_id"],
        order: "id desc",
      },
      auth,
    );
  }

  createReplacement(values: Record<string, unknown>, auth?: OdooRequestAuth) {
    return this.odoo.create<number>(ODOO_MODELS.PICKING, values, auth);
  }

  updateReplacement(id: number, values: Record<string, unknown>, auth?: OdooRequestAuth) {
    return this.odoo.write(ODOO_MODELS.PICKING, [id], values, auth);
  }
}
