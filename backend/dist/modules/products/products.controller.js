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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const products_service_1 = require("./products.service");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    list(user) {
        return this.productsService.list(user);
    }
    listConfigurations(user) {
        return this.productsService.listConfigurations(user);
    }
    findBySerial(serialNumber, user) {
        return this.productsService.findBySerial(serialNumber, user);
    }
    findById(productId, user) {
        return this.productsService.findById(productId, user);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER, role_enum_1.Role.DEALER, role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("configurations"),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER, role_enum_1.Role.DEALER, role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "listConfigurations", null);
__decorate([
    (0, common_1.Get)("serial"),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER, role_enum_1.Role.DEALER, role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Query)("serialNumber")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findBySerial", null);
__decorate([
    (0, common_1.Get)(":productId"),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CUSTOMER, role_enum_1.Role.DEALER, role_enum_1.Role.CUSTOMER_SERVICE, role_enum_1.Role.ADMIN),
    __param(0, (0, common_2.Param)("productId")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findById", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)("products"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map