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
exports.ReplacementController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const replacement_dto_1 = require("./dto/replacement.dto");
const replacement_service_1 = require("./replacement.service");
let ReplacementController = class ReplacementController {
    replacementService;
    constructor(replacementService) {
        this.replacementService = replacementService;
    }
    list(user) {
        return this.replacementService.list(user);
    }
    create(input, user) {
        return this.replacementService.create(input, user);
    }
    updateStatus(replacementId, input, user) {
        return this.replacementService.updateStatus(Number(replacementId), input, user);
    }
};
exports.ReplacementController = ReplacementController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER, role_enum_1.Role.DEALER, role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReplacementController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.DEALER, role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [replacement_dto_1.CreateReplacementDto, Object]),
    __metadata("design:returntype", void 0)
], ReplacementController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":replacementId/status"),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)("replacementId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, replacement_dto_1.UpdateReplacementStatusDto, Object]),
    __metadata("design:returntype", void 0)
], ReplacementController.prototype, "updateStatus", null);
exports.ReplacementController = ReplacementController = __decorate([
    (0, common_1.Controller)("replacements"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [replacement_service_1.ReplacementService])
], ReplacementController);
//# sourceMappingURL=replacement.controller.js.map