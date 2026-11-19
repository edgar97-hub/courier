import { StockAdjustmentService } from '../services/stock-adjustment.service';
import { CreateStockAdjustmentDto } from '../dto/create-stock-adjustment.dto';
export declare class StockAdjustmentController {
    private readonly stockAdjustmentService;
    constructor(stockAdjustmentService: StockAdjustmentService);
    create(dto: CreateStockAdjustmentDto, req: any): Promise<import("../entities/stock-adjustment.entity").StockAdjustmentEntity>;
    findPaginated(page_number?: number, page_size?: number, sort_field?: string, sort_direction?: 'ASC' | 'DESC', search_term?: string): Promise<{
        items: import("../entities/stock-adjustment.entity").StockAdjustmentEntity[];
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    getProductsByCompany(companyId: string): Promise<import("../entities/fulfillment-product.entity").FulfillmentProductEntity[]>;
    getVariationsByProduct(productId: string): Promise<import("../entities/product-variation.entity").ProductVariationEntity[]>;
    getMainWarehouse(): Promise<import("../entities/warehouse.entity").WarehouseEntity>;
    annul(id: string, req: any): Promise<import("../entities/stock-adjustment.entity").StockAdjustmentEntity>;
}
