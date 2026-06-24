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
exports.OdooTicketService = void 0;
const common_1 = require("@nestjs/common");
const odoo_constants_1 = require("../odoo.constants");
const odoo_client_1 = require("./odoo.client");
let OdooTicketService = class OdooTicketService {
    odoo;
    constructor(odoo) {
        this.odoo = odoo;
    }
    findTickets(domain = [], auth) {
        return this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.TICKET, domain, {
            fields: [
                "id",
                "name",
                "partner_id",
                "partner_email",
                "partner_phone",
                "partner_name",
                "stage_id",
                "team_id",
                "priority",
                "description",
                "ticket_ref",
                "create_date",
                "user_id",
            ],
            order: "id desc",
        }, auth);
    }
    async findTicketById(ticketId, auth) {
        const [ticket] = await this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.TICKET, [["id", "=", ticketId]], {
            fields: [
                "id",
                "name",
                "partner_id",
                "partner_email",
                "partner_phone",
                "partner_name",
                "stage_id",
                "team_id",
                "priority",
                "description",
                "ticket_ref",
                "create_date",
                "user_id",
            ],
            limit: 1,
        }, auth);
        return ticket;
    }
    findTicketsBySerialNumber(serialNumber, auth) {
        return this.findTickets([
            "|",
            ["name", "ilike", serialNumber],
            ["description", "ilike", serialNumber],
        ], auth);
    }
    createTicket(values, auth) {
        return this.odoo.create(odoo_constants_1.ODOO_MODELS.TICKET, values, auth);
    }
    updateTicket(id, values, auth) {
        return this.odoo.write(odoo_constants_1.ODOO_MODELS.TICKET, [id], values, auth);
    }
    findStages(auth) {
        return this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.TICKET_STAGE, [], {
            fields: ["id", "name", "sequence", "fold", "team_ids"],
            order: "sequence asc, id asc",
        }, auth);
    }
    findUsersByIds(ids, auth) {
        if (!ids.length) {
            return Promise.resolve([]);
        }
        return this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.USERS, [["id", "in", ids]], {
            fields: ["id", "login", "name", "email", "partner_id"],
        }, auth);
    }
};
exports.OdooTicketService = OdooTicketService;
exports.OdooTicketService = OdooTicketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [odoo_client_1.OdooClient])
], OdooTicketService);
//# sourceMappingURL=odoo-ticket.service.js.map