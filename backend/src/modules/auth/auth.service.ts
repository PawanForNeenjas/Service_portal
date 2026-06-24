import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { PortalUsersService } from "./portal-users.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly portalUsers: PortalUsersService,
  ) {}

  async login(input: LoginDto) {
    try {
      const user = await this.portalUsers.authenticate(input.login, input.password);
      const accessToken = await this.jwt.signAsync({
        sub: user.id,
        ...user,
      });

      this.logger.log(`Login succeeded for ${user.login} with role ${user.role}`);

      return {
        accessToken,
        user,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown login error";
      this.logger.error(
        `Portal login failed for ${input.login}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  signupCustomer(input: SignupDto) {
    return this.portalUsers.signupCustomer(input);
  }

  forgotPassword(input: ForgotPasswordDto) {
    return this.portalUsers.requestPasswordReset(input);
  }
}
