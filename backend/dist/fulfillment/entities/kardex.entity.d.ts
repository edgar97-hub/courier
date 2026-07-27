import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { FulfillmentProductEntity } from './fulfillment-product.entity';
import { ProductVariationEntity } from './product-variation.entity';
import { WarehouseEntity } from './warehouse.entity';
export declare enum KARDEX_MOVEMENT_TYPE {
    INBOUND = "INBOUND",
    ORDER_OUT = "ORDER_OUT",
    MANUAL_ADD = "MANUAL_ADD",
    MANUAL_SUBTRACT = "MANUAL_SUBTRACT",
    ANNUL_REVERSAL = "ANNUL_REVERSAL"
}
export declare class KardexEntity extends BaseEntity {
    movement_type: KARDEX_MOVEMENT_TYPE;
    quantity: number;
    stock_before: number;
    stock_after: number;
    observation: string;
    responsibleUser: UsersEntity;
    responsible_user_id: string;
    reference_id: string;
    reference_type: string;
    company: UsersEntity;
    company_id: string;
    product: FulfillmentProductEntity;
    product_id: string;
    variation: ProductVariationEntity;
    variation_id: string;
    warehouse: WarehouseEntity;
    warehouse_id: string;
}
