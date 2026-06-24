import { AuthUser } from "../../common/types/auth-user.type";
import { CreateReturnDto, UpdateReturnStatusDto } from "./dto/returns.dto";
import { ReturnsService } from "./returns.service";
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
    list(user: AuthUser): Promise<Record<string, unknown>[]>;
    create(input: CreateReturnDto, user: AuthUser): Promise<number>;
    updateStatus(returnId: string, input: UpdateReturnStatusDto, user: AuthUser): Promise<boolean>;
}
