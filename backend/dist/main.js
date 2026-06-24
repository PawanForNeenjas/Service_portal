"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const common_2 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: false });
    const config = app.get(config_1.ConfigService);
    const logger = new common_1.Logger("Bootstrap");
    const allowedOrigins = parseAllowedOrigins(config.get("FRONTEND_ORIGIN"));
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || isAllowedOrigin(origin, allowedOrigins)) {
                callback(null, true);
                return;
            }
            logger.warn(`Rejected CORS origin: ${origin}`);
            callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
        },
        credentials: true,
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    });
    app.setGlobalPrefix("api", {
        exclude: [{ path: "health", method: common_2.RequestMethod.GET }],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = config.get("PORT", 4000);
    logger.log(`CORS origins: ${allowedOrigins.join(", ") || "loopback only"}`);
    await app.listen(port);
}
void bootstrap();
function parseAllowedOrigins(rawValue) {
    return (rawValue ?? "")
        .split(",")
        .map((value) => value.trim().replace(/\/$/, ""))
        .filter(Boolean);
}
function isAllowedOrigin(origin, allowedOrigins) {
    const normalizedOrigin = origin.trim().replace(/\/$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) {
        return true;
    }
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);
}
//# sourceMappingURL=main.js.map