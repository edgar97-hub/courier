import { Repository } from 'typeorm';
import { InventoryEntity } from '../entities/inventory.entity';
export interface PaginatedInventoryQuery {
    items: any[];
    total_count: number;
    page_number: number;
    page_size: number;
}
export declare class InventoryService {
    private readonly inventoryRepository;
    constructor(inventoryRepository: Repository<InventoryEntity>);
    queryInventory(options: {
        page_number: number;
        page_size: number;
        sort_field: string;
        sort_direction: 'ASC' | 'DESC';
        search_term: string;
        filter_company?: string;
        filter_company_id?: string;
        filter_product?: string;
        filter_product_id?: string;
        filter_variation_id?: string;
        filter_sku?: string;
        filter_color?: string;
        filter_size?: string;
        filter_model?: string;
        filter_stock_from?: number;
        filter_stock_to?: number;
        filter_min_stock_from?: number;
        filter_min_stock_to?: number;
    }): Promise<PaginatedInventoryQuery>;
}
