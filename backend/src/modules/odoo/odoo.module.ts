import { Module } from "@nestjs/common";
import { OdooController } from "./odoo.controller";
import { OdooAuthService } from "./services/odoo-auth.service";
import { OdooClient } from "./services/odoo.client";
import { OdooDiagnosticService } from "./services/odoo-diagnostic.service";
import { OdooProductService } from "./services/odoo-product.service";
import { OdooTicketService } from "./services/odoo-ticket.service";
import { OdooWarrantyService } from "./services/odoo-warranty.service";
import { OdooReplacementService } from "./services/odoo-replacement.service";
import { OdooReturnService } from "./services/odoo-return.service";
import { OdooAttachmentService } from "./services/odoo-attachment.service";

@Module({
  controllers: [OdooController],
  providers: [
    OdooClient,
    OdooAuthService,
    OdooDiagnosticService,
    OdooProductService,
    OdooTicketService,
    OdooAttachmentService,
    OdooWarrantyService,
    OdooReplacementService,
    OdooReturnService,
  ],
  exports: [
    OdooClient,
    OdooAuthService,
    OdooProductService,
    OdooTicketService,
    OdooAttachmentService,
    OdooWarrantyService,
    OdooReplacementService,
    OdooReturnService,
  ],
})
export class OdooModule {}
