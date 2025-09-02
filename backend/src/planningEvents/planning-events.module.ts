import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashManagementModule } from '../cashManagement/cashManagement.module';
import { PlanningImportService } from './services/planning-import.service';
import { PlanningImportController } from './controllers/planning-import.controller';
import { RoutesService } from './services/routes.service';
import { RoutesController } from './controllers/routes.controller';
import { PlanningEvent } from './entities/planning-event.entity';
import { Route } from './entities/route.entity';
import { Stop } from './entities/stop.entity';
import { OrdersEntity } from '../orders/entities/orders.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([PlanningEvent, Route, Stop, OrdersEntity]),
    CashManagementModule,
  ],
  providers: [PlanningImportService, RoutesService],
  controllers: [PlanningImportController, RoutesController],
  exports: [PlanningImportService, RoutesService, TypeOrmModule],
})
export class PlanningEventModule {}
