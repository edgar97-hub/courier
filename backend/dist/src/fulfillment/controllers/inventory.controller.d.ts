import { InventoryService } from '../services/inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    queryInventory(page_number?: number, page_size?: number, sort_field?: string, sort_direction?: 'ASC' | 'DESC', search_term?: string, low_stock_only?: string, filter_company?: string, filter_company_id?: string, filter_product?: string, filter_product_id?: string, filter_variation_id?: string, filter_sku?: string, filter_color?: string, filter_size?: string, filter_model?: string, filter_stock_from_str?: string, filter_stock_to_str?: string, filter_min_stock_from_str?: string, filter_min_stock_to_str?: string): Promise<import("../services/inventory.service").PaginatedInventoryQuery>;
}
