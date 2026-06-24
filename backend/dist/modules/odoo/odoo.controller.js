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
exports.OdooController = void 0;
const common_1 = require("@nestjs/common");
const odoo_diagnostic_service_1 = require("./services/odoo-diagnostic.service");
let OdooController = class OdooController {
    diagnostics;
    constructor(diagnostics) {
        this.diagnostics = diagnostics;
    }
    getHealth() {
        return this.diagnostics.getHealth();
    }
    getModels() {
        return this.diagnostics.getModels();
    }
    getProductFields() {
        return this.diagnostics.getProductFields();
    }
    getPartnerFields() {
        return this.diagnostics.getPartnerFields();
    }
    getHelpdeskFields() {
        return this.diagnostics.getHelpdeskFields();
    }
};
exports.OdooController = OdooController;
__decorate([
    (0, common_1.Get)("health"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OdooController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)("models"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OdooController.prototype, "getModels", null);
__decorate([
    (0, common_1.Get)("product-fields"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OdooController.prototype, "getProductFields", null);
__decorate([
    (0, common_1.Get)("partner-fields"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OdooController.prototype, "getPartnerFields", null);
__decorate([
    (0, common_1.Get)("helpdesk-fields"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OdooController.prototype, "getHelpdeskFields", null);
exports.OdooController = OdooController = __decorate([
    (0, common_1.Controller)("odoo"),
    __metadata("design:paramtypes", [odoo_diagnostic_service_1.OdooDiagnosticService])
], OdooController);
//# sourceMappingURL=odoo.controller.js.map