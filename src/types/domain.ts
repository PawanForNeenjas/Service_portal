import type { Role } from "./index";

export type EntityStatus = "ACTIVE" | "INACTIVE";
export type ProductStatus = "REGISTERED" | "UNREGISTERED" | "IN_SERVICE" | "REPLACED";
export type WarrantyStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "UNREGISTERED";
export type TicketPriority = "Low" | "Medium" | "High" | "Critical";
export type TicketStatus =
  | "Created"
  | "Under Review"
  | "In Service"
  | "Replacement Approved"
  | "Dispatched"
  | "Resolved"
  | "Closed";
export type ReplacementStatus = "Requested" | "Approved" | "Dispatched" | "Completed" | "Rejected";
export type ReturnShipmentStatus = "Pending Pickup" | "In Transit" | "Delivered" | "Closed";
export type NotificationTone = "primary" | "success" | "warning" | "error";

export type User = {
  id: string;
  odooPartnerId?: number;
  customerId?: string;
  dealerId?: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
};

export type Customer = {
  id: string;
  odooPartnerId?: number;
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type Dealer = {
  id: string;
  odooPartnerId?: number;
  name: string;
  gstNumber: string;
  contactPerson: string;
};

export type Product = {
  id: string;
  odooProductId?: number;
  odooLotId?: number;
  serialNumber: string;
  model: string;
  brandCode: string;
  modelCode: string;
  productType: string;
  customerId: string;
  dealerId: string;
  warrantyId?: string;
  ticketIds: string[];
  status: ProductStatus;
};

export type Warranty = {
  id: string;
  odooProductId?: number;
  odooLotId?: number;
  odooPartnerId?: number;
  productId: string;
  customerId: string;
  purchaseDate: string;
  expiryDate: string;
  status: WarrantyStatus;
};

export type Ticket = {
  id: string;
  odooHelpdeskTicketId?: number;
  odooPartnerId?: number;
  ticketNumber: string;
  productId: string;
  customerId: string;
  issueCategory: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  description?: string;
  attachmentNames?: string[];
  comments?: TicketComment[];
};

export type TicketComment = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

export type Replacement = {
  id: string;
  odooStockPickingId?: number;
  ticketId: string;
  oldSerial: string;
  newSerial: string;
  status: ReplacementStatus;
};

export type ReturnShipment = {
  id: string;
  odooStockPickingId?: number;
  replacementId: string;
  courier: string;
  trackingNumber: string;
  status: ReturnShipmentStatus;
};

export type Notification = {
  id: string;
  title: string;
  meta: string;
  time: string;
  tone: NotificationTone;
  read: boolean;
  path?: string;
};

export type DomainState = {
  users: User[];
  customers: Customer[];
  dealers: Dealer[];
  products: Product[];
  warranties: Warranty[];
  tickets: Ticket[];
  replacements: Replacement[];
  returns: ReturnShipment[];
  notifications: Notification[];
};

export type ProductView = {
  product: Product;
  customer?: Customer;
  dealer?: Dealer;
  warranty?: Warranty;
  tickets: Ticket[];
  replacements: Replacement[];
  returns: ReturnShipment[];
};
