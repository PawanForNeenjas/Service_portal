"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarrantyService = void 0;
const common_1 = require("@nestjs/common");
const role_enum_1 = require("../../common/enums/role.enum");
const odoo_product_service_1 = require("../odoo/services/odoo-product.service");
const odoo_warranty_service_1 = require("../odoo/services/odoo-warranty.service");
let WarrantyService = class WarrantyService {
    odooProducts;
    odooWarranty;
    constructor(odooProducts, odooWarranty) {
        this.odooProducts = odooProducts;
        this.odooWarranty = odooWarranty;
    }
    list(user) {
        if (user.role === role_enum_1.Role.CUSTOMER && user.partnerId) {
            return this.odooWarranty.findByPartner(user.partnerId);
        }
        if (user.role === role_enum_1.Role.DEALER && user.partnerId) {
            return this.odooWarranty.findByDealer(user.partnerId);
        }
        return this.odooWarranty.findWarranties();
    }
    async registerWarranty(input, user) {
        const lot = await this.odooProducts.findBySerialNumber(input.serialNumber);
        const customerPartnerId = await this.odooWarranty.findOrCreateCustomer({
            name: input.customerName,
            phone: input.customerPhone,
            email: input.customerEmail,
            address: input.customerAddress,
        });
        const warrantyId = await this.odooWarranty.createWarranty({
            x_lot_id: lot.id,
            x_product_id: lot.product_id?.[0],
            x_partner_id: customerPartnerId,
            x_purchase_date: input.purchaseDate,
            x_expiry_date: input.expiryDate,
            x_status: "ACTIVE",
            x_dealer_id: user.partnerId,
        });
        return { id: warrantyId };
    }
};
exports.WarrantyService = WarrantyService;
exports.WarrantyService = WarrantyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [odoo_product_service_1.OdooProductService,
        odoo_warranty_service_1.OdooWarrantyService])
], WarrantyService);
//# sourceMappingURL=warranty.service.js.map