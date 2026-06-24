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
exports.ReplacementService = void 0;
const common_1 = require("@nestjs/common");
const role_enum_1 = require("../../common/enums/role.enum");
const odoo_replacement_service_1 = require("../odoo/services/odoo-replacement.service");
let ReplacementService = class ReplacementService {
    odooReplacements;
    constructor(odooReplacements) {
        this.odooReplacements = odooReplacements;
    }
    list(user) {
        if ((user.role === role_enum_1.Role.CUSTOMER || user.role === role_enum_1.Role.DEALER) && user.partnerId) {
            return this.odooReplacements.findReplacements([["partner_id", "=", user.partnerId]]);
        }
        return this.odooReplacements.findReplacements();
    }
    create(input, user) {
        return this.odooReplacements.createReplacement({
            origin: `Helpdesk Ticket ${input.ticketId}`,
            partner_id: user.partnerId,
            x_helpdesk_ticket_id: input.ticketId,
            x_portal_status: "REQUESTED",
            note: input.reason,
        });
    }
    updateStatus(replacementId, input, user) {
        return this.odooReplacements.updateReplacement(replacementId, {
            x_portal_status: input.status,
        });
    }
};
exports.ReplacementService = ReplacementService;
exports.ReplacementService = ReplacementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [odoo_replacement_service_1.OdooReplacementService])
], ReplacementService);
//# sourceMappingURL=replacement.service.js.map