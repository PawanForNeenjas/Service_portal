import { TicketStatus } from "../../../common/enums/status.enum";
export declare enum TicketPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare class CreateTicketDto {
    productId: string;
    customerName?: string;
    volt?: string;
    amp?: string;
    rating?: string;
    issueCategory: string;
    priority: TicketPriority;
    description?: string;
}
export declare class UpdateTicketStatusDto {
    status: TicketStatus;
}
export declare class CreateTicketCommentDto {
    message: string;
}
