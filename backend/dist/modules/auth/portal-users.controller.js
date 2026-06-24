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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalUsersController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const portal_users_service_1 = require("./portal-users.service");
const create_internal_user_dto_1 = require("./dto/create-internal-user.dto");
const update_portal_user_dto_1 = require("./dto/update-portal-user.dto");
let PortalUsersController = class PortalUsersController {
    portalUsers;
    constructor(portalUsers) {
        this.portalUsers = portalUsers;
    }
    listUsers() {
        return this.portalUsers.listUsers();
    }
    listPasswordResetRequests() {
        return this.portalUsers.listPasswordResetRequests();
    }
    createInternalUser(input) {
        return this.portalUsers.createInternalUser(input);
    }
    updateStatus(userId, input, user) {
        return this.portalUsers.updateStatus(userId, input.status, user.id);
    }
    resetPassword(userId, input) {
        return this.portalUsers.resetPassword(userId, input.password);
    }
};
exports.PortalUsersController = PortalUsersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PortalUsersController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Get)("password-reset-requests"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PortalUsersController.prototype, "listPasswordResetRequests", null);
__decorate([
    (0, common_1.Post)("internal"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_internal_user_dto_1.CreateInternalUserDto]),
    __metadata("design:returntype", void 0)
], PortalUsersController.prototype, "createInternalUser", null);
__decorate([
    (0, common_1.Patch)(":userId/status"),
    __param(0, (0, common_1.Param)("userId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_portal_user_dto_1.UpdatePortalUserStatusDto, Object]),
    __metadata("design:returntype", void 0)
], PortalUsersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(":userId/reset-password"),
    __param(0, (0, common_1.Param)("userId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_portal_user_dto_1.ResetPortalUserPasswordDto]),
    __metadata("design:returntype", void 0)
], PortalUsersController.prototype, "resetPassword", null);
exports.PortalUsersController = PortalUsersController = __decorate([
    (0, common_1.Controller)("portal-users"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:paramtypes", [portal_users_service_1.PortalUsersService])
], PortalUsersController);
//# sourceMappingURL=portal-users.controller.js.map