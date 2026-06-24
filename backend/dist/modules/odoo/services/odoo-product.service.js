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
exports.OdooProductService = void 0;
const common_1 = require("@nestjs/common");
const odoo_constants_1 = require("../odoo.constants");
const odoo_client_1 = require("./odoo.client");
let OdooProductService = class OdooProductService {
    odoo;
    constructor(odoo) {
        this.odoo = odoo;
    }
    findLots(domain = [], auth) {
        return this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.LOT, domain, {
            fields: ["id", "name", "product_id", "last_delivery_partner_id", "ref", "sale_order_ids", "location_id"],
            order: "id desc",
        }, auth);
    }
    findProducts(domain = [], auth) {
        return this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.PRODUCT, domain, {
            fields: ["id", "display_name", "name", "default_code", "code", "make", "product_tmpl_id", "rm_code", "tracking", "type"],
            order: "name asc",
        }, auth);
    }
    async findProductById(productId, auth) {
        const [product] = await this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.PRODUCT, [["id", "=", productId]], {
            fields: ["id", "display_name", "name", "default_code", "code", "make", "product_tmpl_id", "rm_code", "tracking", "type"],
            limit: 1,
        }, auth);
        if (!product) {
            throw new common_1.NotFoundException("Product was not found in ODOO");
        }
        return product;
    }
    async findLotById(lotId, auth) {
        const [lot] = await this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.LOT, [["id", "=", lotId]], {
            fields: ["id", "name", "product_id", "last_delivery_partner_id", "ref", "sale_order_ids", "location_id"],
            limit: 1,
        }, auth);
        if (!lot) {
            throw new common_1.NotFoundException("Product serial record was not found in ODOO");
        }
        return lot;
    }
    async findBySerialNumber(serialNumber, auth) {
        const [lot] = await this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.LOT, [["name", "=", serialNumber]], {
            fields: ["id", "name", "product_id", "last_delivery_partner_id", "ref", "sale_order_ids", "location_id"],
            limit: 1,
        }, auth);
        if (!lot) {
            throw new common_1.NotFoundException("Serial number was not found in ODOO inventory");
        }
        return lot;
    }
    findLotsByDealer(dealerPartnerId, auth) {
        void dealerPartnerId;
        void auth;
        return Promise.resolve([]);
    }
    findLotsByCustomer(customerPartnerId, auth) {
        return this.findLots([["last_delivery_partner_id", "=", customerPartnerId]], auth);
    }
};
exports.OdooProductService = OdooProductService;
exports.OdooProductService = OdooProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [odoo_client_1.OdooClient])
], OdooProductService);
//# sourceMappingURL=odoo-product.service.js.map