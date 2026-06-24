import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthUser } from "../../common/types/auth-user.type";
import { CreateReturnDto, UpdateReturnStatusDto } from "./dto/returns.dto";
import { ReturnsService } from "./returns.service";

@Controller("returns")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  list(@CurrentUser() user: AuthUser) {
    return this.returnsService.list(user);
  }

  @Post()
  @Roles(Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  create(@Body() input: CreateReturnDto, @CurrentUser() user: AuthUser) {
    return this.returnsService.create(input, user);
  }

  @Patch(":returnId/status")
  @Roles(Role.CUSTOMER_SERVICE, Role.ADMIN)
  updateStatus(
    @Param("returnId") returnId: string,
    @Body() input: UpdateReturnStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.returnsService.updateStatus(Number(returnId), input, user);
  }
}
