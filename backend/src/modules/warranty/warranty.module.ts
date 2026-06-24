import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OdooModule } from "../odoo/odoo.module";
import { WarrantyController } from "./warranty.controller";
import { WarrantyService } from "./warranty.service";

@Module({
  imports: [AuthModule, OdooModule],
  controllers: [WarrantyController],
  providers: [WarrantyService],
})
export class WarrantyModule {}
