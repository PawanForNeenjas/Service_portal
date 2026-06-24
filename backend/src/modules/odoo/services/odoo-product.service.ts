import { Injectable, NotFoundException } from "@nestjs/common";
import { ODOO_MODELS } from "../odoo.constants";
import { OdooLotRecord, OdooProductRecord, OdooRequestAuth } from "../odoo.types";
import { OdooClient } from "./odoo.client";

@Injectable()
export class OdooProductService {
  constructor(private readonly odoo: OdooClient) {}

  findLots(domain: unknown[] = [], auth?: OdooRequestAuth) {
    return this.odoo.searchRead<OdooLotRecord>(
      ODOO_MODELS.LOT,
      domain,
      {
        fields: ["id", "name", "product_id", "last_delivery_partner_id", "ref", "sale_order_ids", "location_id"],
        order: "id desc",
      },
      auth,
    );
  }

  findProducts(domain: unknown[] = [], auth?: OdooRequestAuth) {
    return this.odoo.searchRead<OdooProductRecord>(
      ODOO_MODELS.PRODUCT,
      domain,
      {
        fields: ["id", "display_name", "name", "default_code", "code", "make", "product_tmpl_id", "rm_code", "tracking", "type"],
        order: "name asc",
      },
      auth,
    );
  }

  async findProductById(productId: number, auth?: OdooRequestAuth) {
    const [product] = await this.odoo.searchRead<OdooProductRecord>(
      ODOO_MODELS.PRODUCT,
      [["id", "=", productId]],
      {
        fields: ["id", "display_name", "name", "default_code", "code", "make", "product_tmpl_id", "rm_code", "tracking", "type"],
        limit: 1,
      },
      auth,
    );

    if (!product) {
      throw new NotFoundException("Product was not found in ODOO");
    }

    return product;
  }

  async findLotById(lotId: number, auth?: OdooRequestAuth) {
    const [lot] = await this.odoo.searchRead<OdooLotRecord>(
      ODOO_MODELS.LOT,
      [["id", "=", lotId]],
      {
        fields: ["id", "name", "product_id", "last_delivery_partner_id", "ref", "sale_order_ids", "location_id"],
        limit: 1,
      },
      auth,
    );

    if (!lot) {
      throw new NotFoundException("Product serial record was not found in ODOO");
    }

    return lot;
  }

  async findBySerialNumber(serialNumber: string, auth?: OdooRequestAuth) {
    const [lot] = await this.odoo.searchRead<OdooLotRecord>(
      ODOO_MODELS.LOT,
      [["name", "=", serialNumber]],
      {
        fields: ["id", "name", "product_id", "last_delivery_partner_id", "ref", "sale_order_ids", "location_id"],
        limit: 1,
      },
      auth,
    );

    if (!lot) {
      throw new NotFoundException("Serial number was not found in ODOO inventory");
    }

    return lot;
  }

  findLotsByDealer(dealerPartnerId: number, auth?: OdooRequestAuth): Promise<OdooLotRecord[]> {
    void dealerPartnerId;
    void auth;
    return Promise.resolve([]);
  }

  findLotsByCustomer(customerPartnerId: number, auth?: OdooRequestAuth) {
    return this.findLots([["last_delivery_partner_id", "=", customerPartnerId]], auth);
  }
}
