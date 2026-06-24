import { ConfigService } from "@nestjs/config";
import { OdooDomain, OdooRequestAuth, OdooSearchReadOptions } from "../odoo.types";
type OdooVersionInfo = {
    server_version: string;
    server_version_info: [number, number, number, string, number, string];
    server_serie: string;
    protocol_version: number;
};
export declare class OdooClient {
    private readonly config;
    private readonly logger;
    private resolvedDatabase?;
    private discoveredDatabases?;
    constructor(config: ConfigService);
    authenticate(username?: string, password?: string): Promise<number>;
    executeKw<T>(model: string, method: string, args?: unknown[], kwargs?: Record<string, unknown>, auth?: OdooRequestAuth): Promise<T>;
    searchRead<T>(model: string, domain: OdooDomain, options?: OdooSearchReadOptions, auth?: OdooRequestAuth): Promise<T[]>;
    create<T = number>(model: string, values: Record<string, unknown>, auth?: OdooRequestAuth): Promise<T>;
    write(model: string, ids: number[], values: Record<string, unknown>, auth?: OdooRequestAuth): Promise<boolean>;
    fieldsGet<T extends Record<string, unknown>>(model: string, attributes?: string[], auth?: OdooRequestAuth): Promise<Record<string, T>>;
    version(): Promise<OdooVersionInfo>;
    listDatabases(): Promise<string[]>;
    getResolvedDatabase(): Promise<string>;
    private getCredentials;
    private getConfiguredUrl;
    private getProtocol;
    private resolveDatabase;
    private jsonRpcCall;
    private xmlRpcVersion;
    private xmlRpcAuthenticate;
    private xmlRpcExecuteKw;
}
export {};
