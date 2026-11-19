import { Repository, DataSource } from 'typeorm';
import { FulfillmentProductEntity } from '../entities/fulfillment-product.entity';
import { ProductVariationEntity } from '../entities/product-variation.entity';
import { InventoryEntity } from '../entities/inventory.entity';
import { StockAdjustmentEntity } from '../entities/stock-adjustment.entity';
import { KardexEntity } from '../entities/kardex.entity';
import { CreateFulfillmentProductDto } from '../dto/create-fulfillment-product.dto';
import { StockAdjustmentService } from './stock-adjustment.service';
export interface PaginatedProducts {
    items: FulfillmentProductEntity[];
    total_count: number;
    page_number: number;
    page_size: number;
}
export declare class FulfillmentService {
    private readonly productRepository;
    private readonly variationRepository;
    private readonly inventoryRepository;
    private readonly adjustmentRepository;
    private readonly kardexRepository;
    private readonly stockAdjustmentService;
    private readonly dataSource;
    constructor(productRepository: Repository<FulfillmentProductEntity>, variationRepository: Repository<ProductVariationEntity>, inventoryRepository: Repository<InventoryEntity>, adjustmentRepository: Repository<StockAdjustmentEntity>, kardexRepository: Repository<KardexEntity>, stockAdjustmentService: StockAdjustmentService, dataSource: DataSource);
    create(dto: CreateFulfillmentProductDto): Promise<FulfillmentProductEntity>;
    findAll(): Promise<FulfillmentProductEntity[]>;
    findProductsPaginated(options: {
        page_number: number;
        page_size: number;
        sort_field: string;
        sort_direction: 'ASC' | 'DESC';
        search_term: string;
    }): Promise<PaginatedProducts>;
    findDistinctProductNames(): Promise<string[]>;
    findDistinctVariationValues(): Promise<{
        colors: string[];
        sizes: string[];
        models: string[];
    }>;
    findOne(id: string): Promise<FulfillmentProductEntity>;
    update(id: string, dto: Partial<CreateFulfillmentProductDto>): Promise<FulfillmentProductEntity>;
    private throwFriendlyDuplicateError;
    checkVariationDeletable(variationId: string): Promise<{
        deletable: boolean;
        reasons: string[];
    }>;
    private getVariationBlockReasons;
    remove(id: string): Promise<void>;
}
