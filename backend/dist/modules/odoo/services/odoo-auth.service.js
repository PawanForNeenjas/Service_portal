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
exports.OdooAuthService = void 0;
const common_1 = require("@nestjs/common");
const role_enum_1 = require("../../../common/enums/role.enum");
const odoo_constants_1 = require("../odoo.constants");
const odoo_client_1 = require("./odoo.client");
let OdooAuthService = class OdooAuthService {
    odoo;
    constructor(odoo) {
        this.odoo = odoo;
    }
    async authenticateUser(login, password) {
        const uid = await this.odoo.authenticate(login, password);
        if (!uid) {
            throw new common_1.UnauthorizedException("Invalid ODOO credentials");
        }
        const auth = {
            uid,
            password,
        };
        const [user] = await this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.USERS, [["id", "=", uid]], {
            fields: ["id", "login", "name", "email", "partner_id", "groups_id"],
            limit: 1,
        }, auth);
        if (!user) {
            throw new common_1.UnauthorizedException("ODOO user was not found");
        }
        return {
            id: user.id,
            login: user.login,
            name: user.name,
            email: user.email,
            partnerId: user.partner_id?.[0],
            role: await this.resolveRole(user.groups_id ?? [], auth),
            odooUid: uid,
        };
    }
    async findUserByPartnerId(partnerId) {
        const [user] = await this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.USERS, [["partner_id", "=", partnerId]], {
            fields: ["id", "login", "name", "email", "partner_id", "groups_id"],
            limit: 1,
        });
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            login: user.login,
            name: user.name,
            email: user.email,
            partnerId: user.partner_id?.[0],
            role: await this.resolveRole(user.groups_id ?? [], undefined),
            odooUid: user.id,
        };
    }
    async findUserByLoginOrEmail(identifier) {
        const normalizedIdentifier = identifier.trim();
        if (!normalizedIdentifier) {
            return null;
        }
        const [user] = await this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.USERS, [
            "|",
            ["login", "=", normalizedIdentifier],
            ["email", "=", normalizedIdentifier],
        ], {
            fields: ["id", "login", "name", "email", "partner_id", "groups_id"],
            limit: 1,
        });
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            login: user.login,
            name: user.name,
            email: user.email,
            partnerId: user.partner_id?.[0],
            role: await this.resolveRole(user.groups_id ?? [], undefined),
            odooUid: user.id,
        };
    }
    async resolveRole(groupIds, auth) {
        const groupXmlIds = await this.odoo.searchRead("ir.model.data", [["model", "=", "res.groups"], ["res_id", "in", groupIds]], { fields: ["res_id", "module", "name"] }, auth);
        const xmlIds = new Set(groupXmlIds.map((group) => `${group.module}.${group.name}`));
        if (xmlIds.has(odoo_constants_1.ODOO_GROUP_XML_IDS.ADMIN))
            return role_enum_1.Role.ADMIN;
        if (xmlIds.has(odoo_constants_1.ODOO_GROUP_XML_IDS.CUSTOMER_SERVICE))
            return role_enum_1.Role.CUSTOMER_SERVICE;
        if (xmlIds.has(odoo_constants_1.ODOO_GROUP_XML_IDS.DEALER))
            return role_enum_1.Role.DEALER;
        return role_enum_1.Role.CUSTOMER;
    }
};
exports.OdooAuthService = OdooAuthService;
exports.OdooAuthService = OdooAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [odoo_client_1.OdooClient])
], OdooAuthService);
//# sourceMappingURL=odoo-auth.service.js.map