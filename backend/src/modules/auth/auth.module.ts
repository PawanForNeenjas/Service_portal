import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { OdooModule } from "../odoo/odoo.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PortalUsersController } from "./portal-users.controller";
import { PortalUsersService } from "./portal-users.service";

const authModuleLogger = new Logger("AuthModule");

@Module({
  imports: [
    OdooModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const expiresIn = config.get<string>("JWT_EXPIRES_IN", "1h") as NonNullable<
          JwtModuleOptions["signOptions"]
        >["expiresIn"];
        const configuredSecret = config.get<string>("JWT_SECRET")?.trim();
        const testAuthEnabled = config.get<string>("AUTH_TEST_MODE", "true") !== "false";
        const secret = configuredSecret || (testAuthEnabled ? "neenjas-test-jwt-secret" : undefined);

        if (!secret) {
          throw new Error("JWT_SECRET must be configured when test authentication is disabled");
        }

        if (!configuredSecret && testAuthEnabled) {
          authModuleLogger.warn("JWT_SECRET is empty; using test-mode fallback secret for local authentication");
        }

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController, PortalUsersController],
  providers: [AuthService, PortalUsersService],
  exports: [AuthService, JwtModule, PortalUsersService],
})
export class AuthModule {}
