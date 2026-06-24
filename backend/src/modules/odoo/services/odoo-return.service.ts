import { Injectable } from "@nestjs/common";
import { ODOO_MODELS } from "../odoo.constants";
import { OdooRequestAuth } from "../odoo.types";
import { OdooClient } from "./odoo.client";

@Injectable()
export class OdooReturnService {
  constructor(private readonly odoo: OdooClient) {}

  findReturns(domain: unknown[] = [], auth?: OdooRequestAuth) {
    return this.odoo.searchRead<Record<string, unknown>>(
      ODOO_MODELS.PICKING,
      domain,
      {
        fields: ["id", "name", "origin", "partner_id", "state", "carrier_id", "carrier_tracking_ref", "x_portal_status"],
        order: "id desc",
      },
      auth,
    );
  }

  createReturn(values: Record<string, unknown>, auth?: OdooRequestAuth) {
    return this.odoo.create<number>(ODOO_MODELS.PICKING, values, auth);
  }

  updateReturn(id: number, values: Record<string, unknown>, auth?: OdooRequestAuth) {
    return this.odoo.write(ODOO_MODELS.PICKING, [id], values, auth);
  }
}
