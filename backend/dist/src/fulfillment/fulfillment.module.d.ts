import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WarehouseEntity } from './entities/warehouse.entity';
export declare class FulfillmentModule implements OnModuleInit {
    private readonly warehouseRepository;
    constructor(warehouseRepository: Repository<WarehouseEntity>);
    onModuleInit(): Promise<void>;
}
