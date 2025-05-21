import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DistrictsModule } from './districts/districts.module';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from './config/data.source';
import { AuthModule } from './auth/auth.module';

import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { ProvidersModule } from './providers/providers.module';
import { SettingsModule } from './settings/settings.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    UsersModule,
    DistrictsModule,
    SettingsModule,
    ProjectsModule,
    AuthModule,
    TasksModule,
    ProvidersModule,
    OrdersModule,
  ],
})
export class AppModule {}
