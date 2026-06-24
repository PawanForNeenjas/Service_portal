import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OdooModule } from "../odoo/odoo.module";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  imports: [AuthModule, OdooModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
