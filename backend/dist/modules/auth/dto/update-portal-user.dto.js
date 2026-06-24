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
exports.ResetPortalUserPasswordDto = exports.UpdatePortalUserStatusDto = void 0;
const class_validator_1 = require("class-validator");
const portal_user_status_enum_1 = require("../../../common/enums/portal-user-status.enum");
class UpdatePortalUserStatusDto {
    status;
}
exports.UpdatePortalUserStatusDto = UpdatePortalUserStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(portal_user_status_enum_1.PortalUserStatus),
    __metadata("design:type", String)
], UpdatePortalUserStatusDto.prototype, "status", void 0);
class ResetPortalUserPasswordDto {
    password;
}
exports.ResetPortalUserPasswordDto = ResetPortalUserPasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], ResetPortalUserPasswordDto.prototype, "password", void 0);
//# sourceMappingURL=update-portal-user.dto.js.map