import { AuthUser } from "../../common/types/auth-user.type";
import { CreateReplacementDto, UpdateReplacementStatusDto } from "./dto/replacement.dto";
import { ReplacementService } from "./replacement.service";
export declare class ReplacementController {
    private readonly replacementService;
    constructor(replacementService: ReplacementService);
    list(user: AuthUser): Promise<Record<string, unknown>[]>;
    create(input: CreateReplacementDto, user: AuthUser): Promise<number>;
    updateStatus(replacementId: string, input: UpdateReplacementStatusDto, user: AuthUser): Promise<boolean>;
}
