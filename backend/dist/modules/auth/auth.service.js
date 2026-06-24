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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const portal_users_service_1 = require("./portal-users.service");
let AuthService = AuthService_1 = class AuthService {
    jwt;
    portalUsers;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(jwt, portalUsers) {
        this.jwt = jwt;
        this.portalUsers = portalUsers;
    }
    async login(input) {
        try {
            const user = await this.portalUsers.authenticate(input.login, input.password);
            const accessToken = await this.jwt.signAsync({
                sub: user.id,
                ...user,
            });
            this.logger.log(`Login succeeded for ${user.login} with role ${user.role}`);
            return {
                accessToken,
                user,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown login error";
            this.logger.error(`Portal login failed for ${input.login}: ${message}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    signupCustomer(input) {
        return this.portalUsers.signupCustomer(input);
    }
    forgotPassword(input) {
        return this.portalUsers.requestPasswordReset(input);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        portal_users_service_1.PortalUsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map