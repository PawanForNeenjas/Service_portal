export type CustomerProductConfiguration = {
    id: string;
    customerName: string;
    volt: string;
    amp: string;
    rating: string;
    displayName: string;
    brandCode: string;
    modelCode: string;
    productType: string;
    internalReference: string;
};
export declare const customerProductMatrix: CustomerProductConfiguration[];
export declare function findCustomerProductConfigurationById(id: string): CustomerProductConfiguration | undefined;
