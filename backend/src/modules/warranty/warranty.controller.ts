import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthUser } from "../../common/types/auth-user.type";
import { CreateWarrantyDto } from "./dto/create-warranty.dto";
import { WarrantyService } from "./warranty.service";

@Controller("warranties")
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  @Get()
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  list(@CurrentUser() user: AuthUser) {
    return this.warrantyService.list(user);
  }

  @Post()
  @Roles(Role.DEALER, Role.ADMIN)
  create(@Body() input: CreateWarrantyDto, @CurrentUser() user: AuthUser) {
    return this.warrantyService.registerWarranty(input, user);
  }
}
