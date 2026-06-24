import { Injectable, NotFoundException } from "@nestjs/common";
import { Role } from "../../common/enums/role.enum";
import { AuthUser } from "../../common/types/auth-user.type";
import { OdooProductRecord } from "../odoo/odoo.types";
import { OdooProductService } from "../odoo/services/odoo-product.service";
import { OdooTicketService } from "../odoo/services/odoo-ticket.service";
import { customerProductMatrix, findCustomerProductConfigurationById, type CustomerProductConfiguration } from "./customer-product-matrix.data";
import {
  deriveBrandCode,
  deriveModelCode,
  derivePortalProductCode,
  extractIssueCategory,
  extractTicketNumber,
  mapPriorityLabel,
  mapStageToPortalStatus,
  parsePortalTicketDescription,
} from "../tickets/ticket-portal.utils";

@Injectable()
export class ProductsService {
  constructor(
    private readonly odooProducts: OdooProductService,
    private readonly odooTickets: OdooTicketService,
  ) {}

  async list(user: AuthUser) {
    void user;
    const products = await this.odooProducts.findProducts();
    return products.map((product) => this.mapProductSummary(product));
  }

  async listConfigurations(user: AuthUser) {
    this.assertProductAccess(user);
    return customerProductMatrix.map((configuration) => this.mapConfigurationSummary(configuration));
  }

  async findBySerial(searchTerm: string, user: AuthUser) {
    const normalized = searchTerm.trim().toLowerCase();
    const products = await this.odooProducts.findProducts();
    const product = products.find((candidate) =>
      [
        derivePortalProductCode(candidate),
        candidate.default_code,
        candidate.code,
        candidate.rm_code,
        candidate.name,
        candidate.display_name,
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.trim().toLowerCase() === normalized),
    );

    if (!product) {
      throw new NotFoundException("Product was not found");
    }

    this.assertProductAccess(user);
    return this.mapProductDetail(product.id, product);
  }

  async findById(productId: string, user: AuthUser) {
    const configuration = findCustomerProductConfigurationById(productId);
    if (configuration) {
      this.assertProductAccess(user);
      return this.mapConfigurationDetail(configuration);
    }

    const numericProductId = Number(productId);
    if (!Number.isFinite(numericProductId)) {
      throw new NotFoundException("Product was not found");
    }

    this.assertProductAccess(user);
    return this.mapProductDetail(numericProductId);
  }

  private mapProductSummary(product: OdooProductRecord) {
    const brandCode = deriveBrandCode(product);
    const modelCode = deriveModelCode(product);

    return {
      id: String(product.id),
      serialNumber: derivePortalProductCode(product),
      productName: product.display_name ?? product.name ?? "Product",
      model: product.rm_code ?? product.code ?? product.default_code ?? product.name ?? "Unknown model",
      productType: product.type ?? "product",
      brandCode,
      modelCode,
    };
  }

  private mapConfigurationSummary(configuration: CustomerProductConfiguration) {
    return {
      id: configuration.id,
      customerName: configuration.customerName,
      volt: configuration.volt,
      amp: configuration.amp,
      rating: configuration.rating,
    };
  }

  private async mapProductDetail(productId: number, productRecord?: OdooProductRecord) {
    const product = productRecord ?? await this.odooProducts.findProductById(productId);
    const brandCode = deriveBrandCode(product);
    const modelCode = deriveModelCode(product);
    const productCode = derivePortalProductCode(product);
    const tickets = (await this.odooTickets.findTickets([["description", "ilike", `Product ID: ${product.id}`]])).filter((ticket) => {
      return parsePortalTicketDescription(ticket.description).productId === product.id;
    });

    return {
      id: String(product.id),
      serialNumber: productCode,
      internalReference: product.default_code ?? product.code ?? "",
      productName: product.display_name ?? product.name ?? "Product",
      model: product.rm_code ?? product.code ?? product.default_code ?? product.name ?? "Unknown model",
      productType: product.type ?? "product",
      brandCode,
      modelCode,
      tracking: product.tracking ?? "",
      warrantyStatus: "UNAVAILABLE",
      source: "ODOO" as const,
      tickets: tickets.map((ticket) => ({
        id: String(ticket.id),
        ticketNumber: extractTicketNumber(ticket),
        status: mapStageToPortalStatus(ticket.stage_id?.[1]),
        issueCategory: extractIssueCategory(ticket),
        priority: mapPriorityLabel(ticket.priority),
        createdAt: ticket.create_date?.slice(0, 10) ?? "",
      })),
    };
  }

  private async mapConfigurationDetail(configuration: CustomerProductConfiguration) {
    const tickets = (await this.odooTickets.findTickets([["description", "ilike", `Configuration ID: ${configuration.id}`]])).filter((ticket) => {
      return parsePortalTicketDescription(ticket.description).configurationId === configuration.id;
    });

    return {
      id: configuration.id,
      serialNumber: configuration.id,
      internalReference: configuration.internalReference,
      productName: configuration.customerName,
      model: `${configuration.volt} / ${configuration.amp} / ${configuration.rating}`,
      productType: configuration.productType,
      brandCode: configuration.brandCode,
      modelCode: configuration.modelCode,
      tracking: "",
      warrantyStatus: "UNAVAILABLE",
      source: "CUSTOMER_MATRIX" as const,
      configuration: {
        id: configuration.id,
        customerName: configuration.customerName,
        volt: configuration.volt,
        amp: configuration.amp,
        rating: configuration.rating,
        displayName: configuration.displayName,
      },
      tickets: tickets.map((ticket) => ({
        id: String(ticket.id),
        ticketNumber: extractTicketNumber(ticket),
        status: mapStageToPortalStatus(ticket.stage_id?.[1]),
        issueCategory: extractIssueCategory(ticket),
        priority: mapPriorityLabel(ticket.priority),
        createdAt: ticket.create_date?.slice(0, 10) ?? "",
      })),
    };
  }

  private assertProductAccess(user: AuthUser) {
    if (
      user.role === Role.ADMIN ||
      user.role === Role.CUSTOMER_SERVICE ||
      user.role === Role.CUSTOMER ||
      user.role === Role.DEALER
    ) {
      return;
    }

    throw new NotFoundException("Product was not found");
  }
}
