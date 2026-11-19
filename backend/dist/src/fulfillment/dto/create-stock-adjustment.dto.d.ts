import { ADJUSTMENT_TYPE } from '../entities/stock-adjustment.entity';
export declare class CreateStockAdjustmentDto {
    adjustment_type: ADJUSTMENT_TYPE;
    quantity: number;
    observation: string;
    company_id: string;
    product_id: string;
    variation_id: string;
    warehouse_id: string;
    responsible_user?: string;
}
