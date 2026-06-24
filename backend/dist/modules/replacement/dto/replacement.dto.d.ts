import { ReplacementStatus } from "../../../common/enums/status.enum";
export declare class CreateReplacementDto {
    ticketId: number;
    reason?: string;
}
export declare class UpdateReplacementStatusDto {
    status: ReplacementStatus;
}
