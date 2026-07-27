import { KardexService } from '../services/kardex.service';
export declare class KardexController {
    private readonly kardexService;
    constructor(kardexService: KardexService);
    findPaginated(page_number?: string, page_size?: string, sort_field?: string, sort_direction?: 'ASC' | 'DESC', search_term?: string, filter_company?: string, filter_company_id?: string, filter_product?: string, filter_sku?: string, filter_movement_type?: string, filter_date_from?: string, filter_date_to?: string, filter_responsible_user?: string, filter_observation?: string, filter_quantity_from?: string, filter_quantity_to?: string, filter_stock_after_from?: string, filter_stock_after_to?: string): Promise<import("../services/kardex.service").PaginatedKardex>;
}
