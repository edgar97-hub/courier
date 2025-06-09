"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const morgan = require("morgan");
const constants_1 = require("./constants");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const bodyParser = require("body-parser");
const fs_1 = require("fs");
const path_2 = require("path");
async function bootstrap() {
    const httpsOptions = {
        key: fs_1.default.readFileSync(path_2.default.resolve('/etc/letsencrypt/live/jncourier.com/privkey.pem')),
        cert: fs_1.default.readFileSync(path_2.default.resolve('/etc/letsencrypt/live/jncourier.com/fullchain.pem')),
    };
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        httpsOptions,
    });
    app.use(morgan('dev'));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    const configservice = app.get(config_1.ConfigService);
    app.enableCors(constants_1.CORS);
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('courier API')
        .setDescription('courier')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const uploadsStaticPath = (0, path_1.join)(__dirname, '..', 'public', 'uploads');
    app.useStaticAssets(uploadsStaticPath, {
        prefix: '/uploads/',
    });
    const angularAppStaticPath = (0, path_1.join)(__dirname, '..', 'public', 'angular', 'browser');
    app.useStaticAssets(angularAppStaticPath);
    app.use((req, res, next) => {
        const path = req.path;
        console.log(`Middleware catch-all SPA: Petición para ${path}`);
        if (!path.startsWith('/api/') &&
            !path.startsWith('/uploads/') &&
            !path.split('/').pop()?.includes('.')) {
            const angularIndexHtmlPath = (0, path_1.join)(angularAppStaticPath, 'index.html');
            res.sendFile(angularIndexHtmlPath);
        }
        else {
            next();
        }
    });
    await app.listen(configservice.get('PORT') ?? 3000);
    console.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map