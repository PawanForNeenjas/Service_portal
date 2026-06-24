import { Injectable } from "@nestjs/common";
import { ODOO_MODELS } from "../odoo.constants";
import { OdooRequestAuth, OdooWarrantyRecord } from "../odoo.types";
import { OdooClient } from "./odoo.client";

@Injectable()
export class OdooWarrantyService {
  constructor(private readonly odoo: OdooClient) {}

  findByPartner(partnerId: number, auth?: OdooRequestAuth) {
    return this.findWarranties([["x_partner_id", "=", partnerId]], auth);
  }

  findByDealer(dealerPartnerId: number, auth?: OdooRequestAuth) {
    return this.findWarranties([["x_dealer_id", "=", dealerPartnerId]], auth);
  }

  findWarranties(domain: unknown[] = [], auth?: OdooRequestAuth) {
    return this.odoo.searchRead<OdooWarrantyRecord>(
      ODOO_MODELS.WARRANTY,
      domain,
      {
        fields: ["id", "x_product_id", "x_lot_id", "x_partner_id", "x_purchase_date", "x_expiry_date", "x_status"],
        order: "id desc",
      },
      auth,
    );
  }

  createWarranty(values: Record<string, unknown>, auth?: OdooRequestAuth) {
    return this.odoo.create<number>(ODOO_MODELS.WARRANTY, values, auth);
  }

  async findOrCreateCustomer(values: { name: string; phone: string; email?: string; address?: string }, auth?: OdooRequestAuth) {
    const domain: unknown[] = values.email
      ? ["|", ["email", "=", values.email], ["phone", "=", values.phone]]
      : [["phone", "=", values.phone]];

    const [partner] = await this.odoo.searchRead<{ id: number }>(
      ODOO_MODELS.PARTNER,
      domain,
      { fields: ["id"], limit: 1 },
      auth,
    );

    if (partner) {
      return partner.id;
    }

    return this.odoo.create<number>(
      ODOO_MODELS.PARTNER,
      {
        name: values.name,
        phone: values.phone,
        email: values.email,
        street: values.address,
        customer_rank: 1,
      },
      auth,
    );
  }
}
