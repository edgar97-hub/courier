import { Repository, EntityManager } from 'typeorm';
import { StockAdjustmentEntity } from '../entities/stock-adjustment.entity';
import { InventoryEntity } from '../entities/inventory.entity';
import { FulfillmentProductEntity } from '../entities/fulfillment-product.entity';
import { ProductVariationEntity } from '../entities/product-variation.entity';
import { WarehouseEntity } from '../entities/warehouse.entity';
import { CreateStockAdjustmentDto } from '../dto/create-stock-adjustment.dto';
import { KardexService } from './kardex.service';
export declare class StockAdjustmentService {
    private readonly adjustmentRepository;
    private readonly inventoryRepository;
    private readonly productRepository;
    private readonly variationRepository;
    private readonly warehouseRepository;
    private readonly kardexService;
    constructor(adjustmentRepository: Repository<StockAdjustmentEntity>, inventoryRepository: Repository<InventoryEntity>, productRepository: Repository<FulfillmentProductEntity>, variationRepository: Repository<ProductVariationEntity>, warehouseRepository: Repository<WarehouseEntity>, kardexService: KardexService);
    create(dto: CreateStockAdjustmentDto, userId?: string, manager?: EntityManager): Promise<StockAdjustmentEntity>;
    private createWithManager;
    findPaginated(options: {
        page_number: number;
        page_size: number;
        sort_field: string;
        sort_direction: 'ASC' | 'DESC';
        search_term: string;
    }): Promise<{
        items: StockAdjustmentEntity[];
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    getProductsByCompany(companyId: string): Promise<FulfillmentProductEntity[]>;
    getVariationsByProduct(productId: string): Promise<ProductVariationEntity[]>;
    getMainWarehouse(): Promise<WarehouseEntity>;
    annul(id: string, userId?: string): Promise<StockAdjustmentEntity>;
}
