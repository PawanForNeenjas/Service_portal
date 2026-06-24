import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthUser } from "../../common/types/auth-user.type";
import { CreateReplacementDto, UpdateReplacementStatusDto } from "./dto/replacement.dto";
import { ReplacementService } from "./replacement.service";

@Controller("replacements")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReplacementController {
  constructor(private readonly replacementService: ReplacementService) {}

  @Get()
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  list(@CurrentUser() user: AuthUser) {
    return this.replacementService.list(user);
  }

  @Post()
  @Roles(Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  create(@Body() input: CreateReplacementDto, @CurrentUser() user: AuthUser) {
    return this.replacementService.create(input, user);
  }

  @Patch(":replacementId/status")
  @Roles(Role.CUSTOMER_SERVICE, Role.ADMIN)
  updateStatus(
    @Param("replacementId") replacementId: string,
    @Body() input: UpdateReplacementStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.replacementService.updateStatus(Number(replacementId), input, user);
  }
}
