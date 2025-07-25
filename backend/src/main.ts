import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';
import { CORS } from './constants';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const certPath = '/etc/letsencrypt/live/app.jncourier.com/';

  const httpsOptions = {
    key: fs.readFileSync(path.resolve(certPath, 'privkey.pem')),
    cert: fs.readFileSync(path.resolve(certPath, 'fullchain.pem')),
  };
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });
  //  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(morgan('dev'));
  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  const configservice = app.get(ConfigService);
  app.enableCors(CORS);
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('courier API')
    .setDescription('courier')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const uploadsStaticPath = join(__dirname, '..', 'public', 'uploads');
  app.useStaticAssets(uploadsStaticPath, {
    prefix: '/uploads/',
  });

  const angularAppStaticPath = join(
    __dirname,
    '..',
    'public',
    'angular',
    'browser',
  );
  app.useStaticAssets(angularAppStaticPath);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const path = req.path;
    console.log(`Middleware catch-all SPA: Petición para ${path}`);

    if (
      !path.startsWith('/api/') &&
      !path.startsWith('/uploads/') &&
      !path.split('/').pop()?.includes('.')
    ) {
      const angularIndexHtmlPath = join(angularAppStaticPath, 'index.html');
      res.sendFile(angularIndexHtmlPath);
    } else {
      next();
    }
  });

  await app.listen(configservice.get('PORT') ?? 3000);
  console.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
