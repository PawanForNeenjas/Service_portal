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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const portal_users_service_1 = require("../../modules/auth/portal-users.service");
let JwtAuthGuard = class JwtAuthGuard {
    jwtService;
    portalUsers;
    constructor(jwtService, portalUsers) {
        this.jwtService = jwtService;
        this.portalUsers = portalUsers;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token) {
            throw new common_1.UnauthorizedException("Missing bearer token");
        }
        try {
            const payload = await this.jwtService.verifyAsync(token);
            const currentUser = await this.portalUsers.getActiveAuthUserById(payload.sub);
            if (!currentUser) {
                throw new common_1.UnauthorizedException("Account is no longer active");
            }
            request.user = currentUser;
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException("Invalid bearer token");
        }
    }
    extractToken(request) {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        portal_users_service_1.PortalUsersService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map