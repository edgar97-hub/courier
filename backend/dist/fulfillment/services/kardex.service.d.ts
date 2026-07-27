import { Repository } from 'typeorm';
import { KardexEntity, KARDEX_MOVEMENT_TYPE } from '../entities/kardex.entity';
export interface PaginatedKardex {
    items: any[];
    total_count: number;
    page_number: number;
    page_size: number;
}
export declare class KardexService {
    private readonly kardexRepository;
    constructor(kardexRepository: Repository<KardexEntity>);
    create(entry: {
        movement_type: KARDEX_MOVEMENT_TYPE;
        quantity: number;
        stock_before: number;
        stock_after: number;
        observation?: string;
        responsible_user_id?: string;
        reference_id?: string;
        reference_type?: string;
        company_id?: string;
        product_id?: string;
        variation_id: string;
        warehouse_id?: string;
    }): Promise<KardexEntity>;
    findPaginated(options: {
        page_number: number;
        page_size: number;
        sort_field: string;
        sort_direction: 'ASC' | 'DESC';
        search_term: string;
        filter_company?: string;
        filter_company_id?: string;
        filter_product?: string;
        filter_sku?: string;
        filter_movement_type?: string;
        filter_date_from?: string;
        filter_date_to?: string;
        filter_responsible_user?: string;
        filter_observation?: string;
        filter_quantity_from?: number;
        filter_quantity_to?: number;
        filter_stock_after_from?: number;
        filter_stock_after_to?: number;
    }): Promise<PaginatedKardex>;
}
