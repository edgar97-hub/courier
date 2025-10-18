import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DistributorRecordsModule } from './distributor-records/distributor-records.module';
import { DistrictsModule } from './districts/districts.module';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from './config/data.source';
import { AuthModule } from './auth/auth.module';

import { ProvidersModule } from './providers/providers.module';
import { SettingsModule } from './settings/settings.module';
import { OrdersModule } from './orders/orders.module';
import { CashManagementModule } from './cashManagement/cashManagement.module';
import { PlanningEventModule } from './planningEvents/planning-events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    UsersModule,
    DistrictsModule,
    SettingsModule,
    AuthModule,
    ProvidersModule,
    OrdersModule,
    CashManagementModule,
    PlanningEventModule,
    DistributorRecordsModule,
  ],
})
export class AppModule {}
