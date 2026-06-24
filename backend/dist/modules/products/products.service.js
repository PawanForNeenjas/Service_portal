"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const role_enum_1 = require("../../common/enums/role.enum");
const odoo_product_service_1 = require("../odoo/services/odoo-product.service");
const odoo_ticket_service_1 = require("../odoo/services/odoo-ticket.service");
const customer_product_matrix_data_1 = require("./customer-product-matrix.data");
const ticket_portal_utils_1 = require("../tickets/ticket-portal.utils");
let ProductsService = class ProductsService {
    odooProducts;
    odooTickets;
    constructor(odooProducts, odooTickets) {
        this.odooProducts = odooProducts;
        this.odooTickets = odooTickets;
    }
    async list(user) {
        void user;
        const products = await this.odooProducts.findProducts();
        return products.map((product) => this.mapProductSummary(product));
    }
    async listConfigurations(user) {
        this.assertProductAccess(user);
        return customer_product_matrix_data_1.customerProductMatrix.map((configuration) => this.mapConfigurationSummary(configuration));
    }
    async findBySerial(searchTerm, user) {
        const normalized = searchTerm.trim().toLowerCase();
        const products = await this.odooProducts.findProducts();
        const product = products.find((candidate) => [
            (0, ticket_portal_utils_1.derivePortalProductCode)(candidate),
            candidate.default_code,
            candidate.code,
            candidate.rm_code,
            candidate.name,
            candidate.display_name,
        ]
            .filter((value) => Boolean(value))
            .some((value) => value.trim().toLowerCase() === normalized));
        if (!product) {
            throw new common_1.NotFoundException("Product was not found");
        }
        this.assertProductAccess(user);
        return this.mapProductDetail(product.id, product);
    }
    async findById(productId, user) {
        const configuration = (0, customer_product_matrix_data_1.findCustomerProductConfigurationById)(productId);
        if (configuration) {
            this.assertProductAccess(user);
            return this.mapConfigurationDetail(configuration);
        }
        const numericProductId = Number(productId);
        if (!Number.isFinite(numericProductId)) {
            throw new common_1.NotFoundException("Product was not found");
        }
        this.assertProductAccess(user);
        return this.mapProductDetail(numericProductId);
    }
    mapProductSummary(product) {
        const brandCode = (0, ticket_portal_utils_1.deriveBrandCode)(product);
        const modelCode = (0, ticket_portal_utils_1.deriveModelCode)(product);
        return {
            id: String(product.id),
            serialNumber: (0, ticket_portal_utils_1.derivePortalProductCode)(product),
            productName: product.display_name ?? product.name ?? "Product",
            model: product.rm_code ?? product.code ?? product.default_code ?? product.name ?? "Unknown model",
            productType: product.type ?? "product",
            brandCode,
            modelCode,
        };
    }
    mapConfigurationSummary(configuration) {
        return {
            id: configuration.id,
            customerName: configuration.customerName,
            volt: configuration.volt,
            amp: configuration.amp,
            rating: configuration.rating,
        };
    }
    async mapProductDetail(productId, productRecord) {
        const product = productRecord ?? await this.odooProducts.findProductById(productId);
        const brandCode = (0, ticket_portal_utils_1.deriveBrandCode)(product);
        const modelCode = (0, ticket_portal_utils_1.deriveModelCode)(product);
        const productCode = (0, ticket_portal_utils_1.derivePortalProductCode)(product);
        const tickets = (await this.odooTickets.findTickets([["description", "ilike", `Product ID: ${product.id}`]])).filter((ticket) => {
            return (0, ticket_portal_utils_1.parsePortalTicketDescription)(ticket.description).productId === product.id;
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
            source: "ODOO",
            tickets: tickets.map((ticket) => ({
                id: String(ticket.id),
                ticketNumber: (0, ticket_portal_utils_1.extractTicketNumber)(ticket),
                status: (0, ticket_portal_utils_1.mapStageToPortalStatus)(ticket.stage_id?.[1]),
                issueCategory: (0, ticket_portal_utils_1.extractIssueCategory)(ticket),
                priority: (0, ticket_portal_utils_1.mapPriorityLabel)(ticket.priority),
                createdAt: ticket.create_date?.slice(0, 10) ?? "",
            })),
        };
    }
    async mapConfigurationDetail(configuration) {
        const tickets = (await this.odooTickets.findTickets([["description", "ilike", `Configuration ID: ${configuration.id}`]])).filter((ticket) => {
            return (0, ticket_portal_utils_1.parsePortalTicketDescription)(ticket.description).configurationId === configuration.id;
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
            source: "CUSTOMER_MATRIX",
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
                ticketNumber: (0, ticket_portal_utils_1.extractTicketNumber)(ticket),
                status: (0, ticket_portal_utils_1.mapStageToPortalStatus)(ticket.stage_id?.[1]),
                issueCategory: (0, ticket_portal_utils_1.extractIssueCategory)(ticket),
                priority: (0, ticket_portal_utils_1.mapPriorityLabel)(ticket.priority),
                createdAt: ticket.create_date?.slice(0, 10) ?? "",
            })),
        };
    }
    assertProductAccess(user) {
        if (user.role === role_enum_1.Role.ADMIN ||
            user.role === role_enum_1.Role.CUSTOMER_SERVICE ||
            user.role === role_enum_1.Role.CUSTOMER ||
            user.role === role_enum_1.Role.DEALER) {
            return;
        }
        throw new common_1.NotFoundException("Product was not found");
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [odoo_product_service_1.OdooProductService,
        odoo_ticket_service_1.OdooTicketService])
], ProductsService);
//# sourceMappingURL=products.service.js.map