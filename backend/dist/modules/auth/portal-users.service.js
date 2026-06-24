"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PortalUsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalUsersService = void 0;
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const role_enum_1 = require("../../common/enums/role.enum");
const portal_user_status_enum_1 = require("../../common/enums/portal-user-status.enum");
const odoo_auth_service_1 = require("../odoo/services/odoo-auth.service");
const DEFAULT_STORE = {
    users: [],
    passwordResetRequests: [],
};
const INTERNAL_ROLES = new Set([role_enum_1.Role.ADMIN, role_enum_1.Role.CUSTOMER_SERVICE]);
let PortalUsersService = PortalUsersService_1 = class PortalUsersService {
    config;
    odooAuth;
    logger = new common_1.Logger(PortalUsersService_1.name);
    writeQueue = Promise.resolve();
    constructor(config, odooAuth) {
        this.config = config;
        this.odooAuth = odooAuth;
    }
    async ensureInitialized() {
        const store = await this.readStore();
        let seeded = false;
        seeded = await this.ensureSeededUser(store, {
            name: "Neenjas Admin",
            phone: "",
            email: "admin@neenjastechnologies.com",
            role: role_enum_1.Role.ADMIN,
            status: portal_user_status_enum_1.PortalUserStatus.ACTIVE,
            customerName: "",
            password: this.config.get("PORTAL_ADMIN_PASSWORD", "Admin@12345"),
        }) || seeded;
        seeded = await this.ensureSeededUser(store, {
            name: "Customer Service",
            phone: "",
            email: "support@neenjastechnologies.com",
            role: role_enum_1.Role.CUSTOMER_SERVICE,
            status: portal_user_status_enum_1.PortalUserStatus.ACTIVE,
            customerName: "",
            password: this.config.get("PORTAL_SUPPORT_PASSWORD", "Support@12345"),
        }) || seeded;
        if (seeded) {
            await this.writeStore(store);
        }
    }
    async authenticate(login, password) {
        await this.ensureInitialized();
        const store = await this.readStore();
        const user = this.findByIdentifier(store.users, login);
        if (!user) {
            throw new common_1.UnauthorizedException("Invalid login credentials");
        }
        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException("Invalid login credentials");
        }
        if (user.status === portal_user_status_enum_1.PortalUserStatus.PENDING) {
            throw new common_1.ForbiddenException("Your account is pending admin approval");
        }
        if (user.status !== portal_user_status_enum_1.PortalUserStatus.ACTIVE) {
            throw new common_1.ForbiddenException("Your account is inactive. Please contact Neenjas support.");
        }
        return this.buildAuthUser(user);
    }
    async getActiveAuthUserById(userId) {
        await this.ensureInitialized();
        const store = await this.readStore();
        const user = store.users.find((candidate) => candidate.id === userId);
        if (!user || user.status !== portal_user_status_enum_1.PortalUserStatus.ACTIVE) {
            return null;
        }
        return this.buildAuthUser(user);
    }
    async signupCustomer(input) {
        await this.ensureInitialized();
        return this.withStore(async (store) => {
            const normalizedPhone = normalizePhone(input.phone);
            const normalizedEmail = normalizeEmail(input.email);
            if (!normalizedPhone) {
                throw new common_1.BadRequestException("A valid mobile number is required");
            }
            if (store.users.some((user) => normalizePhone(user.phone) === normalizedPhone)) {
                throw new common_1.BadRequestException("A portal account with this mobile number already exists");
            }
            if (normalizedEmail && store.users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
                throw new common_1.BadRequestException("A portal account with this email already exists");
            }
            const now = new Date().toISOString();
            const user = {
                id: getNextUserId(store.users),
                name: input.name.trim(),
                phone: input.phone.trim(),
                email: input.email?.trim() ?? "",
                passwordHash: await bcrypt.hash(input.password, 10),
                role: role_enum_1.Role.CUSTOMER,
                status: portal_user_status_enum_1.PortalUserStatus.PENDING,
                customerName: input.customerName.trim(),
                createdAt: now,
                updatedAt: now,
            };
            store.users.unshift(user);
            return this.toPortalUserDto(user);
        });
    }
    async createInternalUser(input) {
        await this.ensureInitialized();
        return this.withStore(async (store) => {
            const role = this.assertInternalRole(input.role);
            const normalizedEmail = normalizeEmail(input.email);
            if (!normalizedEmail) {
                throw new common_1.BadRequestException("A valid email address is required");
            }
            if (store.users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
                throw new common_1.BadRequestException("A portal account with this email already exists");
            }
            const now = new Date().toISOString();
            const user = {
                id: getNextUserId(store.users),
                name: input.name.trim(),
                phone: "",
                email: input.email.trim(),
                passwordHash: await bcrypt.hash(input.password, 10),
                role,
                status: portal_user_status_enum_1.PortalUserStatus.ACTIVE,
                customerName: "",
                createdAt: now,
                updatedAt: now,
            };
            store.users.unshift(user);
            return this.toPortalUserDto(user);
        });
    }
    async requestPasswordReset(input) {
        await this.ensureInitialized();
        return this.withStore(async (store) => {
            const now = new Date().toISOString();
            const matchedUser = this.findByIdentifier(store.users, input.identifier);
            store.passwordResetRequests.unshift({
                id: (0, crypto_1.randomUUID)(),
                identifier: input.identifier.trim(),
                userId: matchedUser?.id,
                createdAt: now,
                updatedAt: now,
                status: "OPEN",
            });
            return {
                accepted: true,
            };
        });
    }
    async listUsers() {
        await this.ensureInitialized();
        const store = await this.readStore();
        return [...store.users]
            .sort((left, right) => {
            if (left.status === right.status) {
                return right.updatedAt.localeCompare(left.updatedAt);
            }
            if (left.status === portal_user_status_enum_1.PortalUserStatus.PENDING)
                return -1;
            if (right.status === portal_user_status_enum_1.PortalUserStatus.PENDING)
                return 1;
            return right.updatedAt.localeCompare(left.updatedAt);
        })
            .map((user) => this.toPortalUserDto(user));
    }
    async listPasswordResetRequests() {
        await this.ensureInitialized();
        const store = await this.readStore();
        const usersById = new Map(store.users.map((user) => [user.id, user]));
        return [...store.passwordResetRequests]
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
            .map((request) => {
            const user = request.userId ? usersById.get(request.userId) : undefined;
            return {
                id: request.id,
                identifier: request.identifier,
                status: request.status,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                resolvedAt: request.resolvedAt,
                user: user ? this.toPortalUserDto(user) : null,
            };
        });
    }
    async updateStatus(userId, status, actorId) {
        await this.ensureInitialized();
        return this.withStore(async (store) => {
            const target = store.users.find((user) => user.id === userId);
            if (!target) {
                throw new common_1.NotFoundException("Portal user was not found");
            }
            if (target.role === role_enum_1.Role.ADMIN && target.id === actorId && status !== portal_user_status_enum_1.PortalUserStatus.ACTIVE) {
                throw new common_1.BadRequestException("You cannot deactivate your own admin account");
            }
            if (target.role === role_enum_1.Role.ADMIN && status !== portal_user_status_enum_1.PortalUserStatus.ACTIVE) {
                const activeAdmins = store.users.filter((user) => user.role === role_enum_1.Role.ADMIN && user.status === portal_user_status_enum_1.PortalUserStatus.ACTIVE);
                if (activeAdmins.length <= 1) {
                    throw new common_1.BadRequestException("At least one active admin account is required");
                }
            }
            target.status = status;
            target.updatedAt = new Date().toISOString();
            return this.toPortalUserDto(target);
        });
    }
    async resetPassword(userId, password) {
        await this.ensureInitialized();
        return this.withStore(async (store) => {
            const user = store.users.find((candidate) => candidate.id === userId);
            if (!user) {
                throw new common_1.NotFoundException("Portal user was not found");
            }
            this.assertInternalRole(user.role);
            const now = new Date().toISOString();
            user.passwordHash = await bcrypt.hash(password, 10);
            user.updatedAt = now;
            for (const request of store.passwordResetRequests) {
                if (request.status === "OPEN" && request.userId === userId) {
                    request.status = "RESOLVED";
                    request.updatedAt = now;
                    request.resolvedAt = now;
                }
            }
            return this.toPortalUserDto(user);
        });
    }
    assertInternalRole(role) {
        if (!INTERNAL_ROLES.has(role)) {
            throw new common_1.BadRequestException("Only internal user roles can be managed from this action");
        }
        return role;
    }
    async buildAuthUser(user) {
        const login = user.email.trim() || user.phone.trim();
        const authUser = {
            id: user.id,
            login,
            name: user.name,
            email: user.email || undefined,
            phone: user.phone,
            status: user.status,
            customerName: user.customerName || undefined,
            role: user.role,
            partnerId: undefined,
            odooUid: 0,
        };
        if ((user.role === role_enum_1.Role.CUSTOMER_SERVICE || user.role === role_enum_1.Role.ADMIN) && user.email) {
            const odooUser = await this.odooAuth.findUserByLoginOrEmail(user.email).catch(() => null);
            if (odooUser) {
                authUser.partnerId = odooUser.partnerId;
                authUser.odooUid = odooUser.odooUid;
            }
        }
        return authUser;
    }
    async ensureSeededUser(store, input) {
        const normalizedEmail = normalizeEmail(input.email);
        const existingUser = store.users.find((user) => normalizeEmail(user.email) === normalizedEmail);
        if (existingUser) {
            return false;
        }
        const now = new Date().toISOString();
        store.users.push({
            id: getNextUserId(store.users),
            name: input.name,
            phone: input.phone,
            email: input.email,
            passwordHash: await bcrypt.hash(input.password, 10),
            role: input.role,
            status: input.status,
            customerName: input.customerName,
            createdAt: now,
            updatedAt: now,
        });
        this.logger.log(`Seeded portal account for ${input.email}`);
        return true;
    }
    async withStore(mutator) {
        const run = async () => {
            const store = await this.readStore();
            const result = await mutator(store);
            await this.writeStore(store);
            return result;
        };
        const next = this.writeQueue.then(run, run);
        this.writeQueue = next.then(() => undefined, () => undefined);
        return next;
    }
    async readStore() {
        const storePath = this.getStorePath();
        await (0, promises_1.mkdir)((0, path_1.dirname)(storePath), { recursive: true });
        try {
            const raw = await (0, promises_1.readFile)(storePath, "utf8");
            const parsed = JSON.parse(raw);
            return {
                users: Array.isArray(parsed.users) ? parsed.users : [],
                passwordResetRequests: Array.isArray(parsed.passwordResetRequests) ? parsed.passwordResetRequests : [],
            };
        }
        catch {
            await (0, promises_1.writeFile)(storePath, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
            return {
                users: [],
                passwordResetRequests: [],
            };
        }
    }
    async writeStore(store) {
        const storePath = this.getStorePath();
        await (0, promises_1.mkdir)((0, path_1.dirname)(storePath), { recursive: true });
        await (0, promises_1.writeFile)(storePath, JSON.stringify(store, null, 2), "utf8");
    }
    getStorePath() {
        const configuredPath = this.config.get("PORTAL_USER_STORE_PATH")?.trim();
        if (configuredPath) {
            return (0, path_1.resolve)(configuredPath);
        }
        const backendScoped = (0, path_1.resolve)(process.cwd(), "data", "portal-users.json");
        const repoScoped = (0, path_1.resolve)(process.cwd(), "backend", "data", "portal-users.json");
        return (0, path_1.basename)(process.cwd()).toLowerCase() === "backend" ? backendScoped : repoScoped;
    }
    findByIdentifier(users, identifier) {
        const normalizedIdentifier = identifier.trim();
        const normalizedEmail = normalizeEmail(normalizedIdentifier);
        const normalizedPhone = normalizePhone(normalizedIdentifier);
        return users.find((user) => {
            if (normalizedEmail && normalizeEmail(user.email) === normalizedEmail) {
                return true;
            }
            return normalizedPhone && normalizePhone(user.phone) === normalizedPhone;
        });
    }
    toPortalUserDto(user) {
        return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email || undefined,
            role: user.role,
            status: user.status,
            customerName: user.customerName || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
};
exports.PortalUsersService = PortalUsersService;
exports.PortalUsersService = PortalUsersService = PortalUsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        odoo_auth_service_1.OdooAuthService])
], PortalUsersService);
function normalizeEmail(value) {
    const trimmed = value?.trim().toLowerCase() ?? "";
    return trimmed || null;
}
function normalizePhone(value) {
    const digits = value?.replace(/\D/g, "") ?? "";
    return digits || null;
}
function getNextUserId(users) {
    return users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
}
//# sourceMappingURL=portal-users.service.js.map