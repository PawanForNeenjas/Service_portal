import { Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as xmlrpc from "xmlrpc";
import { OdooCredentials, OdooDomain, OdooRequestAuth, OdooSearchReadOptions } from "../odoo.types";

type RpcProtocol = "jsonrpc" | "xmlrpc";
type OdooVersionInfo = {
  server_version: string;
  server_version_info: [number, number, number, string, number, string];
  server_serie: string;
  protocol_version: number;
};

@Injectable()
export class OdooClient {
  private readonly logger = new Logger(OdooClient.name);
  private resolvedDatabase?: string;
  private discoveredDatabases?: string[];

  constructor(private readonly config: ConfigService) {}

  async authenticate(username?: string, password?: string): Promise<number> {
    const credentials = await this.getCredentials(username, password);
    const protocol = this.getProtocol();

    if (protocol === "xmlrpc") {
      return this.xmlRpcAuthenticate(credentials);
    }

    return this.jsonRpcCall<number>("/jsonrpc", {
      service: "common",
      method: "login",
      args: [credentials.db, credentials.username, credentials.password],
    }).then((result) => {
      const uid = result;
      if (!uid || typeof uid !== "number") {
        throw new InternalServerErrorException("ODOO authentication failed");
      }
      return uid;
    });
  }

  async executeKw<T>(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {},
    auth?: OdooRequestAuth,
  ): Promise<T> {
    const credentials = await this.getCredentials();
    const resolvedAuth = auth ?? {
      uid: await this.authenticate(),
      password: credentials.password,
    };
    const protocol = this.getProtocol();

    if (protocol === "xmlrpc") {
      return this.xmlRpcExecuteKw<T>(credentials, resolvedAuth, model, method, args, kwargs);
    }

    return this.jsonRpcCall<T>("/jsonrpc", {
      service: "object",
      method: "execute_kw",
      args: [credentials.db, resolvedAuth.uid, resolvedAuth.password, model, method, args, kwargs],
    });
  }

  searchRead<T>(model: string, domain: OdooDomain, options: OdooSearchReadOptions = {}, auth?: OdooRequestAuth) {
    return this.executeKw<T[]>(
      model,
      "search_read",
      [domain],
      {
        fields: options.fields,
        limit: options.limit,
        offset: options.offset,
        order: options.order,
      },
      auth,
    );
  }

  create<T = number>(model: string, values: Record<string, unknown>, auth?: OdooRequestAuth) {
    return this.executeKw<T>(model, "create", [values], {}, auth);
  }

  write(model: string, ids: number[], values: Record<string, unknown>, auth?: OdooRequestAuth) {
    return this.executeKw<boolean>(model, "write", [ids, values], {}, auth);
  }

  fieldsGet<T extends Record<string, unknown>>(
    model: string,
    attributes: string[] = ["string", "type", "relation", "required", "readonly", "store"],
    auth?: OdooRequestAuth,
  ) {
    return this.executeKw<Record<string, T>>(model, "fields_get", [], { attributes }, auth);
  }

  async version() {
    const protocol = this.getProtocol();
    if (protocol === "xmlrpc") {
      return this.xmlRpcVersion();
    }

    return this.jsonRpcCall<OdooVersionInfo>("/jsonrpc", {
      service: "common",
      method: "version",
      args: [],
    });
  }

  async listDatabases() {
    if (this.discoveredDatabases) {
      return this.discoveredDatabases;
    }

    const url = this.getConfiguredUrl();
    let response: Response;
    try {
      response = await fetch(`${url}/web/database/list`, {
        method: "POST",
      });
    } catch (error) {
      this.logger.error("ODOO database discovery failed", error instanceof Error ? error.stack : undefined);
      throw new ServiceUnavailableException("ODOO database discovery failed");
    }

    if (!response.ok) {
      this.logger.error(`ODOO database discovery HTTP ${response.status}`);
      throw new ServiceUnavailableException("ODOO database discovery failed");
    }

    const body = (await response.json()) as { result?: string[] };
    this.discoveredDatabases = body.result ?? [];
    return this.discoveredDatabases;
  }

  async getResolvedDatabase() {
    const credentials = await this.getCredentials();
    return credentials.db;
  }

  private async getCredentials(username?: string, password?: string): Promise<OdooCredentials> {
    const url = this.config.get<string>("ODOO_URL");
    const db = this.config.get<string>("ODOO_DB");
    const configuredUsername = this.config.get<string>("ODOO_USERNAME");
    const configuredPassword = this.config.get<string>("ODOO_PASSWORD");

    if (!url || !configuredUsername || !configuredPassword) {
      throw new ServiceUnavailableException("ODOO environment is not configured");
    }

    return {
      url: url.replace(/\/$/, ""),
      db: await this.resolveDatabase(url.replace(/\/$/, ""), db),
      username: username ?? configuredUsername,
      password: password ?? configuredPassword,
    };
  }

  private getConfiguredUrl() {
    const url = this.config.get<string>("ODOO_URL");
    if (!url) {
      throw new ServiceUnavailableException("ODOO environment is not configured");
    }

    return url.replace(/\/$/, "");
  }

  private getProtocol(): RpcProtocol {
    return this.config.get<RpcProtocol>("ODOO_RPC_PROTOCOL", "jsonrpc");
  }

  private async resolveDatabase(url: string, configuredDb?: string) {
    if (this.resolvedDatabase) {
      return this.resolvedDatabase;
    }

    if (!configuredDb) {
      const databases = await this.listDatabases();
      if (databases.length === 1) {
        this.resolvedDatabase = databases[0];
        return this.resolvedDatabase;
      }

      throw new ServiceUnavailableException("ODOO database is not configured");
    }

    try {
      const databases = await this.listDatabases();
      if (databases.includes(configuredDb)) {
        this.resolvedDatabase = configuredDb;
        return this.resolvedDatabase;
      }

      if (databases.length === 1) {
        this.resolvedDatabase = databases[0];
        this.logger.warn(
          `Configured ODOO_DB "${configuredDb}" was not found. Falling back to discovered database "${this.resolvedDatabase}".`,
        );
        return this.resolvedDatabase;
      }

      this.logger.warn(
        `Configured ODOO_DB "${configuredDb}" was not found. Available databases: ${databases.join(", ") || "none"}.`,
      );
    } catch (error) {
      this.logger.warn(
        `Skipping ODOO database discovery and using configured database "${configuredDb}" due to discovery failure.`,
      );
    }

    this.resolvedDatabase = configuredDb;
    return this.resolvedDatabase;
  }

  private async jsonRpcCall<T>(path: string, params: Record<string, unknown>): Promise<T> {
    const url = this.getConfiguredUrl();
    let response: Response;
    try {
      response = await fetch(`${url}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params,
          id: Date.now(),
        }),
      });
    } catch (error) {
      this.logger.error("ODOO transport error", error instanceof Error ? error.stack : undefined);
      throw new ServiceUnavailableException("ODOO is unavailable");
    }

    if (!response.ok) {
      this.logger.error(`ODOO JSON-RPC HTTP ${response.status}`);
      throw new ServiceUnavailableException("ODOO request failed");
    }

    const body = (await response.json()) as { result?: T; error?: { message?: string; data?: unknown } };
    if (body.error) {
      this.logger.error(body.error.message ?? "ODOO JSON-RPC error", JSON.stringify(body.error.data));
      throw new InternalServerErrorException("ODOO returned an error");
    }

    return body.result as T;
  }

  private xmlRpcVersion(): Promise<OdooVersionInfo> {
    const common = xmlrpc.createClient({ url: `${this.getConfiguredUrl()}/xmlrpc/2/common` });
    return new Promise((resolve, reject) => {
      common.methodCall("version", [], (error, versionInfo) => {
        if (error) {
          reject(new InternalServerErrorException("ODOO XML-RPC version lookup failed"));
          return;
        }
        resolve(versionInfo as OdooVersionInfo);
      });
    });
  }

  private xmlRpcAuthenticate(credentials: OdooCredentials): Promise<number> {
    const common = xmlrpc.createClient({ url: `${credentials.url}/xmlrpc/2/common` });
    return new Promise((resolve, reject) => {
      common.methodCall("authenticate", [credentials.db, credentials.username, credentials.password, {}], (error, uid) => {
        if (error) {
          reject(new InternalServerErrorException("ODOO XML-RPC authentication failed"));
          return;
        }
        resolve(uid as number);
      });
    });
  }

  private xmlRpcExecuteKw<T>(
    credentials: OdooCredentials,
    auth: OdooRequestAuth,
    model: string,
    method: string,
    args: unknown[],
    kwargs: Record<string, unknown>,
  ): Promise<T> {
    const objectClient = xmlrpc.createClient({ url: `${credentials.url}/xmlrpc/2/object` });
    return new Promise((resolve, reject) => {
      objectClient.methodCall(
        "execute_kw",
        [credentials.db, auth.uid, auth.password, model, method, args, kwargs],
        (error, result) => {
          if (error) {
            reject(new ServiceUnavailableException("ODOO XML-RPC request failed"));
            return;
          }
          resolve(result as T);
        },
      );
    });
  }
}
