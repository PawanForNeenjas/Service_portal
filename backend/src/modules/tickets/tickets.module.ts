import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OdooModule } from "../odoo/odoo.module";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";

@Module({
  imports: [AuthModule, OdooModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
