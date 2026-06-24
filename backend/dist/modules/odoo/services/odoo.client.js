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
var OdooClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdooClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const xmlrpc = require("xmlrpc");
let OdooClient = OdooClient_1 = class OdooClient {
    config;
    logger = new common_1.Logger(OdooClient_1.name);
    resolvedDatabase;
    discoveredDatabases;
    constructor(config) {
        this.config = config;
    }
    async authenticate(username, password) {
        const credentials = await this.getCredentials(username, password);
        const protocol = this.getProtocol();
        if (protocol === "xmlrpc") {
            return this.xmlRpcAuthenticate(credentials);
        }
        return this.jsonRpcCall("/jsonrpc", {
            service: "common",
            method: "login",
            args: [credentials.db, credentials.username, credentials.password],
        }).then((result) => {
            const uid = result;
            if (!uid || typeof uid !== "number") {
                throw new common_1.InternalServerErrorException("ODOO authentication failed");
            }
            return uid;
        });
    }
    async executeKw(model, method, args = [], kwargs = {}, auth) {
        const credentials = await this.getCredentials();
        const resolvedAuth = auth ?? {
            uid: await this.authenticate(),
            password: credentials.password,
        };
        const protocol = this.getProtocol();
        if (protocol === "xmlrpc") {
            return this.xmlRpcExecuteKw(credentials, resolvedAuth, model, method, args, kwargs);
        }
        return this.jsonRpcCall("/jsonrpc", {
            service: "object",
            method: "execute_kw",
            args: [credentials.db, resolvedAuth.uid, resolvedAuth.password, model, method, args, kwargs],
        });
    }
    searchRead(model, domain, options = {}, auth) {
        return this.executeKw(model, "search_read", [domain], {
            fields: options.fields,
            limit: options.limit,
            offset: options.offset,
            order: options.order,
        }, auth);
    }
    create(model, values, auth) {
        return this.executeKw(model, "create", [values], {}, auth);
    }
    write(model, ids, values, auth) {
        return this.executeKw(model, "write", [ids, values], {}, auth);
    }
    fieldsGet(model, attributes = ["string", "type", "relation", "required", "readonly", "store"], auth) {
        return this.executeKw(model, "fields_get", [], { attributes }, auth);
    }
    async version() {
        const protocol = this.getProtocol();
        if (protocol === "xmlrpc") {
            return this.xmlRpcVersion();
        }
        return this.jsonRpcCall("/jsonrpc", {
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
        let response;
        try {
            response = await fetch(`${url}/web/database/list`, {
                method: "POST",
            });
        }
        catch (error) {
            this.logger.error("ODOO database discovery failed", error instanceof Error ? error.stack : undefined);
            throw new common_1.ServiceUnavailableException("ODOO database discovery failed");
        }
        if (!response.ok) {
            this.logger.error(`ODOO database discovery HTTP ${response.status}`);
            throw new common_1.ServiceUnavailableException("ODOO database discovery failed");
        }
        const body = (await response.json());
        this.discoveredDatabases = body.result ?? [];
        return this.discoveredDatabases;
    }
    async getResolvedDatabase() {
        const credentials = await this.getCredentials();
        return credentials.db;
    }
    async getCredentials(username, password) {
        const url = this.config.get("ODOO_URL");
        const db = this.config.get("ODOO_DB");
        const configuredUsername = this.config.get("ODOO_USERNAME");
        const configuredPassword = this.config.get("ODOO_PASSWORD");
        if (!url || !configuredUsername || !configuredPassword) {
            throw new common_1.ServiceUnavailableException("ODOO environment is not configured");
        }
        return {
            url: url.replace(/\/$/, ""),
            db: await this.resolveDatabase(url.replace(/\/$/, ""), db),
            username: username ?? configuredUsername,
            password: password ?? configuredPassword,
        };
    }
    getConfiguredUrl() {
        const url = this.config.get("ODOO_URL");
        if (!url) {
            throw new common_1.ServiceUnavailableException("ODOO environment is not configured");
        }
        return url.replace(/\/$/, "");
    }
    getProtocol() {
        return this.config.get("ODOO_RPC_PROTOCOL", "jsonrpc");
    }
    async resolveDatabase(url, configuredDb) {
        if (this.resolvedDatabase) {
            return this.resolvedDatabase;
        }
        if (!configuredDb) {
            const databases = await this.listDatabases();
            if (databases.length === 1) {
                this.resolvedDatabase = databases[0];
                return this.resolvedDatabase;
            }
            throw new common_1.ServiceUnavailableException("ODOO database is not configured");
        }
        try {
            const databases = await this.listDatabases();
            if (databases.includes(configuredDb)) {
                this.resolvedDatabase = configuredDb;
                return this.resolvedDatabase;
            }
            if (databases.length === 1) {
                this.resolvedDatabase = databases[0];
                this.logger.warn(`Configured ODOO_DB "${configuredDb}" was not found. Falling back to discovered database "${this.resolvedDatabase}".`);
                return this.resolvedDatabase;
            }
            this.logger.warn(`Configured ODOO_DB "${configuredDb}" was not found. Available databases: ${databases.join(", ") || "none"}.`);
        }
        catch (error) {
            this.logger.warn(`Skipping ODOO database discovery and using configured database "${configuredDb}" due to discovery failure.`);
        }
        this.resolvedDatabase = configuredDb;
        return this.resolvedDatabase;
    }
    async jsonRpcCall(path, params) {
        const url = this.getConfiguredUrl();
        let response;
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
        }
        catch (error) {
            this.logger.error("ODOO transport error", error instanceof Error ? error.stack : undefined);
            throw new common_1.ServiceUnavailableException("ODOO is unavailable");
        }
        if (!response.ok) {
            this.logger.error(`ODOO JSON-RPC HTTP ${response.status}`);
            throw new common_1.ServiceUnavailableException("ODOO request failed");
        }
        const body = (await response.json());
        if (body.error) {
            this.logger.error(body.error.message ?? "ODOO JSON-RPC error", JSON.stringify(body.error.data));
            throw new common_1.InternalServerErrorException("ODOO returned an error");
        }
        return body.result;
    }
    xmlRpcVersion() {
        const common = xmlrpc.createClient({ url: `${this.getConfiguredUrl()}/xmlrpc/2/common` });
        return new Promise((resolve, reject) => {
            common.methodCall("version", [], (error, versionInfo) => {
                if (error) {
                    reject(new common_1.InternalServerErrorException("ODOO XML-RPC version lookup failed"));
                    return;
                }
                resolve(versionInfo);
            });
        });
    }
    xmlRpcAuthenticate(credentials) {
        const common = xmlrpc.createClient({ url: `${credentials.url}/xmlrpc/2/common` });
        return new Promise((resolve, reject) => {
            common.methodCall("authenticate", [credentials.db, credentials.username, credentials.password, {}], (error, uid) => {
                if (error) {
                    reject(new common_1.InternalServerErrorException("ODOO XML-RPC authentication failed"));
                    return;
                }
                resolve(uid);
            });
        });
    }
    xmlRpcExecuteKw(credentials, auth, model, method, args, kwargs) {
        const objectClient = xmlrpc.createClient({ url: `${credentials.url}/xmlrpc/2/object` });
        return new Promise((resolve, reject) => {
            objectClient.methodCall("execute_kw", [credentials.db, auth.uid, auth.password, model, method, args, kwargs], (error, result) => {
                if (error) {
                    reject(new common_1.ServiceUnavailableException("ODOO XML-RPC request failed"));
                    return;
                }
                resolve(result);
            });
        });
    }
};
exports.OdooClient = OdooClient;
exports.OdooClient = OdooClient = OdooClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OdooClient);
//# sourceMappingURL=odoo.client.js.map