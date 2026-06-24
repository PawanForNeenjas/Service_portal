"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./modules/auth/auth.module");
const odoo_module_1 = require("./modules/odoo/odoo.module");
const products_module_1 = require("./modules/products/products.module");
const warranty_module_1 = require("./modules/warranty/warranty.module");
const tickets_module_1 = require("./modules/tickets/tickets.module");
const replacement_module_1 = require("./modules/replacement/replacement.module");
const returns_module_1 = require("./modules/returns/returns.module");
const health_controller_1 = require("./health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [".env"],
            }),
            odoo_module_1.OdooModule,
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            warranty_module_1.WarrantyModule,
            tickets_module_1.TicketsModule,
            replacement_module_1.ReplacementModule,
            returns_module_1.ReturnsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map