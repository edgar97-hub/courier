import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FulfillmentProductEntity } from './entities/fulfillment-product.entity';
import { ProductVariationEntity } from './entities/product-variation.entity';
import { WarehouseEntity } from './entities/warehouse.entity';
import { InventoryEntity } from './entities/inventory.entity';
import { StockAdjustmentEntity } from './entities/stock-adjustment.entity';
import { KardexEntity } from './entities/kardex.entity';
import { FulfillmentService } from './services/products.service';
import { StockAdjustmentService } from './services/stock-adjustment.service';
import { KardexService } from './services/kardex.service';
import { InventoryService } from './services/inventory.service';
import { ProductsController } from './controllers/products.controller';
import { StockAdjustmentController } from './controllers/stock-adjustment.controller';
import { KardexController } from './controllers/kardex.controller';
import { InventoryController } from './controllers/inventory.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FulfillmentProductEntity,
      ProductVariationEntity,
      WarehouseEntity,
      InventoryEntity,
      StockAdjustmentEntity,
      KardexEntity,
    ]),
  ],
  providers: [FulfillmentService, StockAdjustmentService, KardexService, InventoryService],
  controllers: [ProductsController, StockAdjustmentController, KardexController, InventoryController],
  exports: [FulfillmentService, StockAdjustmentService, KardexService, InventoryService, TypeOrmModule],
})
export class FulfillmentModule implements OnModuleInit {
  constructor(
    @InjectRepository(WarehouseEntity)
    private readonly warehouseRepository: Repository<WarehouseEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    // Seed default main warehouse if it doesn't exist
    const existing = await this.warehouseRepository.findOne({
      where: { code: 'MAIN' },
    });
    if (!existing) {
      const mainWarehouse = this.warehouseRepository.create({
        name: 'Almacén Principal',
        code: 'MAIN',
        is_main: true,
      });
      await this.warehouseRepository.save(mainWarehouse);
      console.log('✅ Default warehouse "Almacén Principal" seeded.');
    }
  }
}
