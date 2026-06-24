import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { OdooModule } from "./modules/odoo/odoo.module";
import { ProductsModule } from "./modules/products/products.module";
import { WarrantyModule } from "./modules/warranty/warranty.module";
import { TicketsModule } from "./modules/tickets/tickets.module";
import { ReplacementModule } from "./modules/replacement/replacement.module";
import { ReturnsModule } from "./modules/returns/returns.module";
import { HealthController } from "./health.controller";

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
    }),
    OdooModule,
    AuthModule,
    ProductsModule,
    WarrantyModule,
    TicketsModule,
    ReplacementModule,
    ReturnsModule,
  ],
})
export class AppModule {}
