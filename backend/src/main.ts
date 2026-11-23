import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';
import { CORS } from './constants';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.enableCors(CORS);
  app.setGlobalPrefix('api');
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const path = req.path;
    const isApi = path.startsWith('/api');
    const isAsset = path.includes('.');
    if (!isApi && !isAsset) {
      console.log(
        `[REQUEST] ${new Date().toISOString()} ${req.method} ${req.originalUrl}` +
          ` ip=${req.ip} remote=${req.socket.remoteAddress}` +
          ` xff=${req.get('x-forwarded-for') || '-'}` +
          ` proto=${req.protocol}` +
          ` host=${req.get('host') || '-'}` +
          ` ua="${req.get('user-agent') || '-'}"` +
          ` referer="${req.get('referer') || '-'}"` +
          ` origin="${req.get('origin') || '-'}"`,
      );
    }
    next();
  });
  app.use(morgan('dev'));
  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(bodyParser.json({ limit: '200mb' }));
  app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
  await app.listen(process.env.PORT ?? 8000);

  console.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
