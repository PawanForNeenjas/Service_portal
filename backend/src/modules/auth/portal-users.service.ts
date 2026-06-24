import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { basename, dirname, resolve } from "path";
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { Role } from "../../common/enums/role.enum";
import { PortalUserStatus } from "../../common/enums/portal-user-status.enum";
import { AuthUser } from "../../common/types/auth-user.type";
import { OdooAuthService } from "../odoo/services/odoo-auth.service";
import { CreateInternalUserDto } from "./dto/create-internal-user.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { SignupDto } from "./dto/signup.dto";
import { PortalAuthStore, PortalUserRecord } from "./portal-user.types";

const DEFAULT_STORE: PortalAuthStore = {
  users: [],
  passwordResetRequests: [],
};
const INTERNAL_ROLES = new Set<Role>([Role.ADMIN, Role.CUSTOMER_SERVICE]);

@Injectable()
export class PortalUsersService {
  private readonly logger = new Logger(PortalUsersService.name);
  private writeQueue = Promise.resolve();

  constructor(
    private readonly config: ConfigService,
    private readonly odooAuth: OdooAuthService,
  ) {}

  async ensureInitialized() {
    const store = await this.readStore();
    let seeded = false;

    seeded = await this.ensureSeededUser(store, {
      name: "Neenjas Admin",
      phone: "",
      email: "admin@neenjastechnologies.com",
      role: Role.ADMIN,
      status: PortalUserStatus.ACTIVE,
      customerName: "",
      password: this.config.get<string>("PORTAL_ADMIN_PASSWORD", "Admin@12345"),
    }) || seeded;

    seeded = await this.ensureSeededUser(store, {
      name: "Customer Service",
      phone: "",
      email: "support@neenjastechnologies.com",
      role: Role.CUSTOMER_SERVICE,
      status: PortalUserStatus.ACTIVE,
      customerName: "",
      password: this.config.get<string>("PORTAL_SUPPORT_PASSWORD", "Support@12345"),
    }) || seeded;

    if (seeded) {
      await this.writeStore(store);
    }
  }

  async authenticate(login: string, password: string) {
    await this.ensureInitialized();

    const store = await this.readStore();
    const user = this.findByIdentifier(store.users, login);
    if (!user) {
      throw new UnauthorizedException("Invalid login credentials");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid login credentials");
    }

    if (user.status === PortalUserStatus.PENDING) {
      throw new ForbiddenException("Your account is pending admin approval");
    }

    if (user.status !== PortalUserStatus.ACTIVE) {
      throw new ForbiddenException("Your account is inactive. Please contact Neenjas support.");
    }

    return this.buildAuthUser(user);
  }

  async getActiveAuthUserById(userId: number) {
    await this.ensureInitialized();

    const store = await this.readStore();
    const user = store.users.find((candidate) => candidate.id === userId);
    if (!user || user.status !== PortalUserStatus.ACTIVE) {
      return null;
    }

    return this.buildAuthUser(user);
  }

  async signupCustomer(input: SignupDto) {
    await this.ensureInitialized();

    return this.withStore(async (store) => {
      const normalizedPhone = normalizePhone(input.phone);
      const normalizedEmail = normalizeEmail(input.email);

      if (!normalizedPhone) {
        throw new BadRequestException("A valid mobile number is required");
      }

      if (store.users.some((user) => normalizePhone(user.phone) === normalizedPhone)) {
        throw new BadRequestException("A portal account with this mobile number already exists");
      }

      if (normalizedEmail && store.users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
        throw new BadRequestException("A portal account with this email already exists");
      }

      const now = new Date().toISOString();
      const user: PortalUserRecord = {
        id: getNextUserId(store.users),
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() ?? "",
        passwordHash: await bcrypt.hash(input.password, 10),
        role: Role.CUSTOMER,
        status: PortalUserStatus.PENDING,
        customerName: input.customerName.trim(),
        createdAt: now,
        updatedAt: now,
      };

      store.users.unshift(user);
      return this.toPortalUserDto(user);
    });
  }

  async createInternalUser(input: CreateInternalUserDto) {
    await this.ensureInitialized();

    return this.withStore(async (store) => {
      const role = this.assertInternalRole(input.role);
      const normalizedEmail = normalizeEmail(input.email);
      if (!normalizedEmail) {
        throw new BadRequestException("A valid email address is required");
      }

      if (store.users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
        throw new BadRequestException("A portal account with this email already exists");
      }

      const now = new Date().toISOString();
      const user: PortalUserRecord = {
        id: getNextUserId(store.users),
        name: input.name.trim(),
        phone: "",
        email: input.email.trim(),
        passwordHash: await bcrypt.hash(input.password, 10),
        role,
        status: PortalUserStatus.ACTIVE,
        customerName: "",
        createdAt: now,
        updatedAt: now,
      };

      store.users.unshift(user);
      return this.toPortalUserDto(user);
    });
  }

  async requestPasswordReset(input: ForgotPasswordDto) {
    await this.ensureInitialized();

    return this.withStore(async (store) => {
      const now = new Date().toISOString();
      const matchedUser = this.findByIdentifier(store.users, input.identifier);

      store.passwordResetRequests.unshift({
        id: randomUUID(),
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
        if (left.status === PortalUserStatus.PENDING) return -1;
        if (right.status === PortalUserStatus.PENDING) return 1;
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

  async updateStatus(userId: number, status: PortalUserStatus, actorId: number) {
    await this.ensureInitialized();

    return this.withStore(async (store) => {
      const target = store.users.find((user) => user.id === userId);
      if (!target) {
        throw new NotFoundException("Portal user was not found");
      }

      if (target.role === Role.ADMIN && target.id === actorId && status !== PortalUserStatus.ACTIVE) {
        throw new BadRequestException("You cannot deactivate your own admin account");
      }

      if (target.role === Role.ADMIN && status !== PortalUserStatus.ACTIVE) {
        const activeAdmins = store.users.filter(
          (user) => user.role === Role.ADMIN && user.status === PortalUserStatus.ACTIVE,
        );
        if (activeAdmins.length <= 1) {
          throw new BadRequestException("At least one active admin account is required");
        }
      }

      target.status = status;
      target.updatedAt = new Date().toISOString();

      return this.toPortalUserDto(target);
    });
  }

  async resetPassword(userId: number, password: string) {
    await this.ensureInitialized();

    return this.withStore(async (store) => {
      const user = store.users.find((candidate) => candidate.id === userId);
      if (!user) {
        throw new NotFoundException("Portal user was not found");
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

  private assertInternalRole(role: Role) {
    if (!INTERNAL_ROLES.has(role)) {
      throw new BadRequestException("Only internal user roles can be managed from this action");
    }

    return role;
  }

  private async buildAuthUser(user: PortalUserRecord): Promise<AuthUser> {
    const login = user.email.trim() || user.phone.trim();
    const authUser: AuthUser = {
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

    if ((user.role === Role.CUSTOMER_SERVICE || user.role === Role.ADMIN) && user.email) {
      const odooUser = await this.odooAuth.findUserByLoginOrEmail(user.email).catch(() => null);
      if (odooUser) {
        authUser.partnerId = odooUser.partnerId;
        authUser.odooUid = odooUser.odooUid;
      }
    }

    return authUser;
  }

  private async ensureSeededUser(
    store: PortalAuthStore,
    input: {
      name: string;
      phone: string;
      email: string;
      role: Role;
      status: PortalUserStatus;
      customerName: string;
      password: string;
    },
  ) {
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

  private async withStore<T>(mutator: (store: PortalAuthStore) => Promise<T> | T) {
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

  private async readStore() {
    const storePath = this.getStorePath();
    await mkdir(dirname(storePath), { recursive: true });

    try {
      const raw = await readFile(storePath, "utf8");
      const parsed = JSON.parse(raw) as PortalAuthStore;
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        passwordResetRequests: Array.isArray(parsed.passwordResetRequests) ? parsed.passwordResetRequests : [],
      } satisfies PortalAuthStore;
    } catch {
      await writeFile(storePath, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
      return {
        users: [],
        passwordResetRequests: [],
      } satisfies PortalAuthStore;
    }
  }

  private async writeStore(store: PortalAuthStore) {
    const storePath = this.getStorePath();
    await mkdir(dirname(storePath), { recursive: true });
    await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
  }

  private getStorePath() {
    const configuredPath = this.config.get<string>("PORTAL_USER_STORE_PATH")?.trim();
    if (configuredPath) {
      return resolve(configuredPath);
    }

    const backendScoped = resolve(process.cwd(), "data", "portal-users.json");
    const repoScoped = resolve(process.cwd(), "backend", "data", "portal-users.json");

    return basename(process.cwd()).toLowerCase() === "backend" ? backendScoped : repoScoped;
  }

  private findByIdentifier(users: PortalUserRecord[], identifier: string) {
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

  private toPortalUserDto(user: PortalUserRecord) {
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
}

function normalizeEmail(value?: string) {
  const trimmed = value?.trim().toLowerCase() ?? "";
  return trimmed || null;
}

function normalizePhone(value?: string) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits || null;
}

function getNextUserId(users: PortalUserRecord[]) {
  return users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
}
