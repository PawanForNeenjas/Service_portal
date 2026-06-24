import { Injectable } from "@nestjs/common";
import { Role } from "../../common/enums/role.enum";
import { AuthUser } from "../../common/types/auth-user.type";
import { OdooProductService } from "../odoo/services/odoo-product.service";
import { OdooWarrantyService } from "../odoo/services/odoo-warranty.service";
import { CreateWarrantyDto } from "./dto/create-warranty.dto";

@Injectable()
export class WarrantyService {
  constructor(
    private readonly odooProducts: OdooProductService,
    private readonly odooWarranty: OdooWarrantyService,
  ) {}

  list(user: AuthUser) {
    if (user.role === Role.CUSTOMER && user.partnerId) {
      return this.odooWarranty.findByPartner(user.partnerId);
    }

    if (user.role === Role.DEALER && user.partnerId) {
      return this.odooWarranty.findByDealer(user.partnerId);
    }

    return this.odooWarranty.findWarranties();
  }

  async registerWarranty(input: CreateWarrantyDto, user: AuthUser) {
    const lot = await this.odooProducts.findBySerialNumber(input.serialNumber);
    const customerPartnerId = await this.odooWarranty.findOrCreateCustomer(
      {
        name: input.customerName,
        phone: input.customerPhone,
        email: input.customerEmail,
        address: input.customerAddress,
      },
    );

    const warrantyId = await this.odooWarranty.createWarranty(
      {
        x_lot_id: lot.id,
        x_product_id: lot.product_id?.[0],
        x_partner_id: customerPartnerId,
        x_purchase_date: input.purchaseDate,
        x_expiry_date: input.expiryDate,
        x_status: "ACTIVE",
        x_dealer_id: user.partnerId,
      },
    );

    return { id: warrantyId };
  }
}
