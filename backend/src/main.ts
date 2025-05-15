import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';
import { CORS } from './constants';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Request, Response } from 'express';
import * as express from 'express';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(morgan('dev'));
  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

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

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use((req: Request, res: Response) => {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  // app.useStaticAssets(join(__dirname, '..', 'public')); // donde está Angular
  // app.setBaseViewsDir(join(__dirname, '..', 'public'));

  // // catch-all route para SPA
  // app.use('*', (req: Request, res: Response) => {
  //   res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  // });
  await app.listen(configservice.get('PORT') ?? 3000);
  console.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
