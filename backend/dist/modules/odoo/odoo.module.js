"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdooModule = void 0;
const common_1 = require("@nestjs/common");
const odoo_controller_1 = require("./odoo.controller");
const odoo_auth_service_1 = require("./services/odoo-auth.service");
const odoo_client_1 = require("./services/odoo.client");
const odoo_diagnostic_service_1 = require("./services/odoo-diagnostic.service");
const odoo_product_service_1 = require("./services/odoo-product.service");
const odoo_ticket_service_1 = require("./services/odoo-ticket.service");
const odoo_warranty_service_1 = require("./services/odoo-warranty.service");
const odoo_replacement_service_1 = require("./services/odoo-replacement.service");
const odoo_return_service_1 = require("./services/odoo-return.service");
const odoo_attachment_service_1 = require("./services/odoo-attachment.service");
let OdooModule = class OdooModule {
};
exports.OdooModule = OdooModule;
exports.OdooModule = OdooModule = __decorate([
    (0, common_1.Module)({
        controllers: [odoo_controller_1.OdooController],
        providers: [
            odoo_client_1.OdooClient,
            odoo_auth_service_1.OdooAuthService,
            odoo_diagnostic_service_1.OdooDiagnosticService,
            odoo_product_service_1.OdooProductService,
            odoo_ticket_service_1.OdooTicketService,
            odoo_attachment_service_1.OdooAttachmentService,
            odoo_warranty_service_1.OdooWarrantyService,
            odoo_replacement_service_1.OdooReplacementService,
            odoo_return_service_1.OdooReturnService,
        ],
        exports: [
            odoo_client_1.OdooClient,
            odoo_auth_service_1.OdooAuthService,
            odoo_product_service_1.OdooProductService,
            odoo_ticket_service_1.OdooTicketService,
            odoo_attachment_service_1.OdooAttachmentService,
            odoo_warranty_service_1.OdooWarrantyService,
            odoo_replacement_service_1.OdooReplacementService,
            odoo_return_service_1.OdooReturnService,
        ],
    })
], OdooModule);
//# sourceMappingURL=odoo.module.js.map