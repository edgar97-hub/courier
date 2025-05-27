import { Global, Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersEntity } from './entities/orders.entity';
import { OrderPdfGeneratorService } from './services/order-pdf-generator.service';
import { OrderLogEntity } from './entities/orderLog.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([OrdersEntity, OrderLogEntity])],
  providers: [OrdersService, OrderPdfGeneratorService],
  controllers: [OrdersController],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
