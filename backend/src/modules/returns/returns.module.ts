import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OdooModule } from "../odoo/odoo.module";
import { ReturnsController } from "./returns.controller";
import { ReturnsService } from "./returns.service";

@Module({
  imports: [AuthModule, OdooModule],
  controllers: [ReturnsController],
  providers: [ReturnsService],
})
export class ReturnsModule {}
