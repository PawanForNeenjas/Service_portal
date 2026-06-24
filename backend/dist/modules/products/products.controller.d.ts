import { AuthUser } from "../../common/types/auth-user.type";
import { ProductsService } from "./products.service";
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
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
    findBySerial(serialNumber: string, user: AuthUser): Promise<{
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
}
