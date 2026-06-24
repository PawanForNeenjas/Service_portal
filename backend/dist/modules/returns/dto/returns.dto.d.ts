import { ReturnStatus } from "../../../common/enums/status.enum";
export declare class CreateReturnDto {
    replacementId: number;
    pickupAddress?: string;
}
export declare class UpdateReturnStatusDto {
    status: ReturnStatus;
}
