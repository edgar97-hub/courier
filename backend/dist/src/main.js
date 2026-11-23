"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const morgan = require("morgan");
const constants_1 = require("./constants");
const common_1 = require("@nestjs/common");
const bodyParser = require("body-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.set('trust proxy', 1);
    app.enableCors(constants_1.CORS);
    app.setGlobalPrefix('api');
    app.use((req, _res, next) => {
        const path = req.path;
        const isApi = path.startsWith('/api');
        const isAsset = path.includes('.');
        if (!isApi && !isAsset) {
            console.log(`[REQUEST] ${new Date().toISOString()} ${req.method} ${req.originalUrl}` +
                ` ip=${req.ip} remote=${req.socket.remoteAddress}` +
                ` xff=${req.get('x-forwarded-for') || '-'}` +
                ` proto=${req.protocol}` +
                ` host=${req.get('host') || '-'}` +
                ` ua="${req.get('user-agent') || '-'}"` +
                ` referer="${req.get('referer') || '-'}"` +
                ` origin="${req.get('origin') || '-'}"`);
        }
        next();
    });
    app.use(morgan('dev'));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    app.use(bodyParser.json({ limit: '200mb' }));
    app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
    await app.listen(process.env.PORT ?? 8000);
    console.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map