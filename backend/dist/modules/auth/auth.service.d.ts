import { JwtService } from "@nestjs/jwt";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { PortalUsersService } from "./portal-users.service";
export declare class AuthService {
    private readonly jwt;
    private readonly portalUsers;
    private readonly logger;
    constructor(jwt: JwtService, portalUsers: PortalUsersService);
    login(input: LoginDto): Promise<{
        accessToken: string;
        user: import("../../common/types/auth-user.type").AuthUser;
    }>;
    signupCustomer(input: SignupDto): Promise<{
        id: number;
        name: string;
        phone: string;
        email: string | undefined;
        role: import("../../common/enums/role.enum").Role;
        status: import("../../common/enums/portal-user-status.enum").PortalUserStatus;
        customerName: string | undefined;
        createdAt: string;
        updatedAt: string;
    }>;
    forgotPassword(input: ForgotPasswordDto): Promise<{
        accepted: boolean;
    }>;
}
