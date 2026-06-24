import { CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PortalUsersService } from "../../modules/auth/portal-users.service";
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly portalUsers;
    constructor(jwtService: JwtService, portalUsers: PortalUsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractToken;
}
