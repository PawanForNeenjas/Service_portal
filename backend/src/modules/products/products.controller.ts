import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Param } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthUser } from "../../common/types/auth-user.type";
import { ProductsService } from "./products.service";

@Controller("products")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  list(@CurrentUser() user: AuthUser) {
    return this.productsService.list(user);
  }

  @Get("configurations")
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  listConfigurations(@CurrentUser() user: AuthUser) {
    return this.productsService.listConfigurations(user);
  }

  @Get("serial")
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  findBySerial(@Query("serialNumber") serialNumber: string, @CurrentUser() user: AuthUser) {
    return this.productsService.findBySerial(serialNumber, user);
  }

  @Get(":productId")
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  findById(@Param("productId") productId: string, @CurrentUser() user: AuthUser) {
    return this.productsService.findById(productId, user);
  }
}
