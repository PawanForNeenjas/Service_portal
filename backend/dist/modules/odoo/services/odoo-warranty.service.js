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
exports.OdooWarrantyService = void 0;
const common_1 = require("@nestjs/common");
const odoo_constants_1 = require("../odoo.constants");
const odoo_client_1 = require("./odoo.client");
let OdooWarrantyService = class OdooWarrantyService {
    odoo;
    constructor(odoo) {
        this.odoo = odoo;
    }
    findByPartner(partnerId, auth) {
        return this.findWarranties([["x_partner_id", "=", partnerId]], auth);
    }
    findByDealer(dealerPartnerId, auth) {
        return this.findWarranties([["x_dealer_id", "=", dealerPartnerId]], auth);
    }
    findWarranties(domain = [], auth) {
        return this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.WARRANTY, domain, {
            fields: ["id", "x_product_id", "x_lot_id", "x_partner_id", "x_purchase_date", "x_expiry_date", "x_status"],
            order: "id desc",
        }, auth);
    }
    createWarranty(values, auth) {
        return this.odoo.create(odoo_constants_1.ODOO_MODELS.WARRANTY, values, auth);
    }
    async findOrCreateCustomer(values, auth) {
        const domain = values.email
            ? ["|", ["email", "=", values.email], ["phone", "=", values.phone]]
            : [["phone", "=", values.phone]];
        const [partner] = await this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.PARTNER, domain, { fields: ["id"], limit: 1 }, auth);
        if (partner) {
            return partner.id;
        }
        return this.odoo.create(odoo_constants_1.ODOO_MODELS.PARTNER, {
            name: values.name,
            phone: values.phone,
            email: values.email,
            street: values.address,
            customer_rank: 1,
        }, auth);
    }
};
exports.OdooWarrantyService = OdooWarrantyService;
exports.OdooWarrantyService = OdooWarrantyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [odoo_client_1.OdooClient])
], OdooWarrantyService);
//# sourceMappingURL=odoo-warranty.service.js.map