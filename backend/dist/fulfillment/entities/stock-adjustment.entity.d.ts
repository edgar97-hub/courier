import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { FulfillmentProductEntity } from './fulfillment-product.entity';
import { ProductVariationEntity } from './product-variation.entity';
import { WarehouseEntity } from './warehouse.entity';
export declare enum ADJUSTMENT_TYPE {
    INBOUND = "INBOUND",
    MANUAL_ADD = "MANUAL_ADD",
    MANUAL_SUBTRACT = "MANUAL_SUBTRACT"
}
export declare enum ADJUSTMENT_STATUS {
    REGISTERED = "REGISTERED",
    ANNULLED = "ANNULLED"
}
export declare class StockAdjustmentEntity extends BaseEntity {
    code: number;
    adjustment_type: ADJUSTMENT_TYPE;
    quantity: number;
    observation: string;
    status: ADJUSTMENT_STATUS;
    company: UsersEntity;
    company_id: string;
    product: FulfillmentProductEntity;
    product_id: string;
    variation: ProductVariationEntity;
    variation_id: string;
    warehouse: WarehouseEntity;
    warehouse_id: string;
}
