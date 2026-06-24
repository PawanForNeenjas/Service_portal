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
exports.OdooReplacementService = void 0;
const common_1 = require("@nestjs/common");
const odoo_constants_1 = require("../odoo.constants");
const odoo_client_1 = require("./odoo.client");
let OdooReplacementService = class OdooReplacementService {
    odoo;
    constructor(odoo) {
        this.odoo = odoo;
    }
    findReplacements(domain = [], auth) {
        return this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.PICKING, domain, {
            fields: ["id", "name", "origin", "partner_id", "state", "picking_type_id", "x_portal_status", "x_helpdesk_ticket_id"],
            order: "id desc",
        }, auth);
    }
    createReplacement(values, auth) {
        return this.odoo.create(odoo_constants_1.ODOO_MODELS.PICKING, values, auth);
    }
    updateReplacement(id, values, auth) {
        return this.odoo.write(odoo_constants_1.ODOO_MODELS.PICKING, [id], values, auth);
    }
};
exports.OdooReplacementService = OdooReplacementService;
exports.OdooReplacementService = OdooReplacementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [odoo_client_1.OdooClient])
], OdooReplacementService);
//# sourceMappingURL=odoo-replacement.service.js.map