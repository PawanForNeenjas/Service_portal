import { AuthUser } from "../../common/types/auth-user.type";
import { OdooProductService } from "../odoo/services/odoo-product.service";
import { OdooTicketService } from "../odoo/services/odoo-ticket.service";
export declare class ProductsService {
    private readonly odooProducts;
    private readonly odooTickets;
    constructor(odooProducts: OdooProductService, odooTickets: OdooTicketService);
    list(user: AuthUser): Promise<{
        id: string;
        serialNumber: string;
        productName: string;
        model: string;
        productType: string;
        brandCode: string;
        modelCode: string;
    }[]>;
    listConfigurations(user: AuthUser): Promise<{
        id: string;
        customerName: string;
        volt: string;
        amp: string;
        rating: string;
    }[]>;
    findBySerial(searchTerm: string, user: AuthUser): Promise<{
        id: string;
        serialNumber: string;
        internalReference: string;
        productName: string;
        model: string;
        productType: string;
        brandCode: string;
        modelCode: string;
        tracking: string;
        warrantyStatus: string;
        source: "ODOO";
        tickets: {
            id: string;
            ticketNumber: string;
            status: string;
            issueCategory: string;
            priority: string;
            createdAt: string;
        }[];
    }>;
    findById(productId: string, user: AuthUser): Promise<{
        id: string;
        serialNumber: string;
        internalReference: string;
        productName: string;
        model: string;
        productType: string;
        brandCode: string;
        modelCode: string;
        tracking: string;
        warrantyStatus: string;
        source: "ODOO";
        tickets: {
            id: string;
            ticketNumber: string;
            status: string;
            issueCategory: string;
            priority: string;
            createdAt: string;
        }[];
    } | {
        id: string;
        serialNumber: string;
        internalReference: string;
        productName: string;
        model: string;
        productType: string;
        brandCode: string;
        modelCode: string;
        tracking: string;
        warrantyStatus: string;
        source: "CUSTOMER_MATRIX";
        configuration: {
            id: string;
            customerName: string;
            volt: string;
            amp: string;
            rating: string;
            displayName: string;
        };
        tickets: {
            id: string;
            ticketNumber: string;
            status: string;
            issueCategory: string;
            priority: string;
            createdAt: string;
        }[];
    }>;
    private mapProductSummary;
    private mapConfigurationSummary;
    private mapProductDetail;
    private mapConfigurationDetail;
    private assertProductAccess;
}
