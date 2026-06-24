import { AuthUser } from "../../common/types/auth-user.type";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    login(input: LoginDto): Promise<{
        accessToken: string;
        user: AuthUser;
    }>;
    signup(input: SignupDto): Promise<{
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
    me(user: AuthUser): AuthUser;
}
