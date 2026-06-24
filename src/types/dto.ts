import type {
  Customer,
  Dealer,
  Notification,
  Product,
  ProductView,
  Replacement,
  ReturnShipment,
  Ticket,
  TicketPriority,
  TicketStatus,
  User,
  Warranty,
} from "./domain";
import type { PortalUserStatus, Role } from "./index";

export type ApiResult<T> = {
  data: T;
};

export type AuthUserDto = {
  id: number;
  login: string;
  name: string;
  email?: string;
  phone: string;
  status: PortalUserStatus;
  customerName?: string;
  partnerId?: number;
  role: Role;
  odooUid: number;
};

export type PortalUserDto = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  status: PortalUserStatus;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
};

export type PortalPasswordResetRequestDto = {
  id: string;
  identifier: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  user: PortalUserDto | null;
};

export type SignupCustomerDto = {
  name: string;
  phone: string;
  email?: string;
  customerName: string;
  password: string;
};

export type ForgotPasswordDto = {
  identifier: string;
};

export type UpdatePortalUserStatusDto = {
  status: PortalUserStatus;
};

export type ResetPortalUserPasswordDto = {
  password: string;
};

export type CreateInternalPortalUserDto = {
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER_SERVICE" | "ADMIN";
};

export type ProductDto = Product;
export type ProductViewDto = ProductView;
export type CustomerDto = Customer;
export type DealerDto = Dealer;

export type TicketDto = Ticket;
export type CreateTicketDto = {
  productId: string;
  issueCategory: string;
  priority: TicketPriority;
  description?: string;
};
export type UpdateTicketStatusDto = {
  ticketId: string;
  status: TicketStatus;
};

export type PortalTicketWorkflowStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "IN_SERVICE"
  | "REPLACEMENT_APPROVED"
  | "REPLACEMENT_DISPATCHED"
  | "RESOLVED"
  | "CLOSED";

export type PortalProductSource = "ODOO" | "CUSTOMER_MATRIX";

export type PortalProductConfigurationDto = {
  id: string;
  customerName: string;
  volt: string;
  amp: string;
  rating: string;
  displayName?: string;
};

export type UpdatePortalTicketStatusDto = {
  status: PortalTicketWorkflowStatus;
};

export type PortalTicketCommentDto = {
  id: string;
  author: string;
  role?: Role;
  message: string;
  createdAt: string;
};

export type PortalTicketAttachmentDto = {
  id: string;
  name: string;
  mimetype: string;
  create_date: string;
};

export type WarrantyDto = Warranty;
export type CreateWarrantyDto = {
  productId: string;
  purchaseDate: string;
};

export type ReplacementDto = Replacement;
export type ReturnShipmentDto = ReturnShipment;
export type NotificationDto = Notification;

export type PortalProductSummaryDto = {
  id: string;
  serialNumber: string;
  productName: string;
  model: string;
  productType: string;
  brandCode: string;
  modelCode: string;
  source?: PortalProductSource;
  configuration?: PortalProductConfigurationDto;
  customer?: {
    id: string;
    name: string;
  };
};

export type PortalProductDetailDto = PortalProductSummaryDto & {
  internalReference: string;
  tracking: string;
  warrantyStatus: "UNAVAILABLE";
  tickets: Array<{
    id: string;
    ticketNumber: string;
    status: string;
    issueCategory: string;
    priority: string;
    createdAt: string;
  }>;
};

export type PortalTicketDto = {
  id: string;
  ticketNumber: string;
  title: string;
  issueCategory: string;
  priority: string;
  status: string;
  stageName: string;
  createdAt: string;
  description: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  assignee?: {
    id: string;
    login: string;
    name: string;
    email: string;
  };
  product?: {
    id: string;
    serialNumber: string;
    productName: string;
    model: string;
    productType: string;
  };
  configuration?: PortalProductConfigurationDto;
  attachments: PortalTicketAttachmentDto[];
  attachmentNames: string[];
  comments: PortalTicketCommentDto[];
  replacement: null;
};

export type CreatePortalTicketDto = {
  productId: string;
  customerName?: string;
  volt?: string;
  amp?: string;
  rating?: string;
  issueCategory: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description?: string;
};

export type CreatePortalTicketCommentDto = {
  message: string;
};

export type PortalTrackedTicketRef = {
  id: string;
  ticketNumber: string;
  productId: string;
  productName: string;
  model: string;
  serialNumber: string;
  createdAt: string;
};
