import { Global, Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersEntity } from './entities/orders.entity';
import { OrderPdfGeneratorService } from './services/order-pdf-generator.service';
import { OrderLogEntity } from './entities/orderLog.entity';
import { CashManagementModule } from '../cashManagement/cashManagement.module';
import { FulfillmentModule } from '../fulfillment/fulfillment.module';
import { InventoryEntity } from '../fulfillment/entities/inventory.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([OrdersEntity, OrderLogEntity, InventoryEntity]),
    CashManagementModule,
    FulfillmentModule,
  ],
  providers: [OrdersService, OrderPdfGeneratorService],
  controllers: [OrdersController],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
