import { Body, Controller, Get, Logger, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthUser } from "../../common/types/auth-user.type";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() input: LoginDto) {
    this.logger.log(`Portal login attempt received for ${input.login}`);
    return this.authService.login(input);
  }

  @Post("signup")
  signup(@Body() input: SignupDto) {
    this.logger.log(`Customer signup received for ${input.phone}`);
    return this.authService.signupCustomer(input);
  }

  @Post("forgot-password")
  forgotPassword(@Body() input: ForgotPasswordDto) {
    this.logger.log(`Password reset request received for ${input.identifier}`);
    return this.authService.forgotPassword(input);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
