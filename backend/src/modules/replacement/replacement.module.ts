import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OdooModule } from "../odoo/odoo.module";
import { ReplacementController } from "./replacement.controller";
import { ReplacementService } from "./replacement.service";

@Module({
  imports: [AuthModule, OdooModule],
  controllers: [ReplacementController],
  providers: [ReplacementService],
})
export class ReplacementModule {}
