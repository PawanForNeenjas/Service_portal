import { Controller, Get } from "@nestjs/common";
import { OdooDiagnosticService } from "./services/odoo-diagnostic.service";

@Controller("odoo")
export class OdooController {
  constructor(private readonly diagnostics: OdooDiagnosticService) {}

  @Get("health")
  getHealth() {
    return this.diagnostics.getHealth();
  }

  @Get("models")
  getModels() {
    return this.diagnostics.getModels();
  }

  @Get("product-fields")
  getProductFields() {
    return this.diagnostics.getProductFields();
  }

  @Get("partner-fields")
  getPartnerFields() {
    return this.diagnostics.getPartnerFields();
  }

  @Get("helpdesk-fields")
  getHelpdeskFields() {
    return this.diagnostics.getHelpdeskFields();
  }
}
