import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DistributorRecordsModule } from './distributor-records/distributor-records.module';
import { DistrictsModule } from './districts/districts.module';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from '../db/datasource';
import { AuthModule } from './auth/auth.module';

import { SettingsModule } from './settings/settings.module';
import { OrdersModule } from './orders/orders.module';
import { CashManagementModule } from './cashManagement/cashManagement.module';
import { PlanningEventModule } from './planningEvents/planning-events.module';
import { FulfillmentModule } from './fulfillment/fulfillment.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(DataSourceConfig),
    UsersModule,
    DistrictsModule,
    SettingsModule,
    AuthModule,
    OrdersModule,
    CashManagementModule,
    PlanningEventModule,
    DistributorRecordsModule,
    FulfillmentModule,
    EventEmitterModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../public/uploads'),
      serveRoot: '/uploads',
    }),
    ServeStaticModule.forRoot({
      // rootPath: join(__dirname, '../public/angular/browser'),
      rootPath: join(__dirname, '../../public/angular/browser'),
      exclude: ['/api/{*test}'],
      serveStaticOptions: {
        index: 'index.html',
        fallthrough: true,
      },
    }),
  ],
})
export class AppModule {}
