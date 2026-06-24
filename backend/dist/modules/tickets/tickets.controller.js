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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const create_ticket_dto_1 = require("./dto/create-ticket.dto");
const tickets_service_1 = require("./tickets.service");
const MAX_ATTACHMENT_BYTES = 100 * 1024 * 1024;
let TicketsController = class TicketsController {
    ticketsService;
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    list(user) {
        return this.ticketsService.list(user);
    }
    findById(ticketId, user) {
        return this.ticketsService.findById(Number(ticketId), user);
    }
    create(input, user) {
        return this.ticketsService.create(input, user);
    }
    addComment(ticketId, input, user) {
        return this.ticketsService.addComment(Number(ticketId), input, user);
    }
    uploadAttachments(ticketId, files, user) {
        return this.ticketsService.uploadAttachments(Number(ticketId), files ?? [], user);
    }
    async downloadAttachment(ticketId, attachmentId, user, response) {
        const attachment = await this.ticketsService.downloadAttachment(Number(ticketId), Number(attachmentId), user);
        response.setHeader("Content-Type", attachment.mimetype);
        response.setHeader("Content-Disposition", `attachment; filename="${sanitizeFilename(attachment.name)}"`);
        return new common_1.StreamableFile(attachment.buffer);
    }
    updateStatus(ticketId, input, user) {
        return this.ticketsService.updateStatus(Number(ticketId), input, user);
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER, role_enum_1.Role.DEALER, role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(":ticketId"),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER, role_enum_1.Role.DEALER, role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)("ticketId")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER, role_enum_1.Role.DEALER, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ticket_dto_1.CreateTicketDto, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(":ticketId/comments"),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER, role_enum_1.Role.DEALER, role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)("ticketId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_ticket_dto_1.CreateTicketCommentDto, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)(":ticketId/attachments"),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER, role_enum_1.Role.DEALER, role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)("files", 12, { limits: { fileSize: MAX_ATTACHMENT_BYTES } })),
    __param(0, (0, common_1.Param)("ticketId")),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "uploadAttachments", null);
__decorate([
    (0, common_1.Get)(":ticketId/attachments/:attachmentId"),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER, role_enum_1.Role.DEALER, role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)("ticketId")),
    __param(1, (0, common_1.Param)("attachmentId")),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "downloadAttachment", null);
__decorate([
    (0, common_1.Patch)(":ticketId/status"),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)("ticketId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_ticket_dto_1.UpdateTicketStatusDto, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "updateStatus", null);
exports.TicketsController = TicketsController = __decorate([
    (0, common_1.Controller)("tickets"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [tickets_service_1.TicketsService])
], TicketsController);
function sanitizeFilename(value) {
    return value.replace(/["\r\n]/g, "").trim() || "attachment";
}
//# sourceMappingURL=tickets.controller.js.map