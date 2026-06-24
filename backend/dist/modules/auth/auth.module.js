"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const odoo_module_1 = require("../odoo/odoo.module");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const portal_users_controller_1 = require("./portal-users.controller");
const portal_users_service_1 = require("./portal-users.service");
const authModuleLogger = new common_1.Logger("AuthModule");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            odoo_module_1.OdooModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const expiresIn = config.get("JWT_EXPIRES_IN", "1h");
                    const configuredSecret = config.get("JWT_SECRET")?.trim();
                    const testAuthEnabled = config.get("AUTH_TEST_MODE", "true") !== "false";
                    const secret = configuredSecret || (testAuthEnabled ? "neenjas-test-jwt-secret" : undefined);
                    if (!secret) {
                        throw new Error("JWT_SECRET must be configured when test authentication is disabled");
                    }
                    if (!configuredSecret && testAuthEnabled) {
                        authModuleLogger.warn("JWT_SECRET is empty; using test-mode fallback secret for local authentication");
                    }
                    return {
                        secret,
                        signOptions: {
                            expiresIn,
                        },
                    };
                },
            }),
        ],
        controllers: [auth_controller_1.AuthController, portal_users_controller_1.PortalUsersController],
        providers: [auth_service_1.AuthService, portal_users_service_1.PortalUsersService],
        exports: [auth_service_1.AuthService, jwt_1.JwtModule, portal_users_service_1.PortalUsersService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map