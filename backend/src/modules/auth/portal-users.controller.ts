import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthUser } from "../../common/types/auth-user.type";
import { PortalUsersService } from "./portal-users.service";
import { CreateInternalUserDto } from "./dto/create-internal-user.dto";
import { ResetPortalUserPasswordDto, UpdatePortalUserStatusDto } from "./dto/update-portal-user.dto";

@Controller("portal-users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PortalUsersController {
  constructor(private readonly portalUsers: PortalUsersService) {}

  @Get()
  listUsers() {
    return this.portalUsers.listUsers();
  }

  @Get("password-reset-requests")
  listPasswordResetRequests() {
    return this.portalUsers.listPasswordResetRequests();
  }

  @Post("internal")
  createInternalUser(@Body() input: CreateInternalUserDto) {
    return this.portalUsers.createInternalUser(input);
  }

  @Patch(":userId/status")
  updateStatus(
    @Param("userId", ParseIntPipe) userId: number,
    @Body() input: UpdatePortalUserStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.portalUsers.updateStatus(userId, input.status, user.id);
  }

  @Post(":userId/reset-password")
  resetPassword(
    @Param("userId", ParseIntPipe) userId: number,
    @Body() input: ResetPortalUserPasswordDto,
  ) {
    return this.portalUsers.resetPassword(userId, input.password);
  }
}
