import { BaseEntity } from '../../config/base.entity';
import { FulfillmentProductEntity } from './fulfillment-product.entity';
import { InventoryEntity } from './inventory.entity';
export declare class ProductVariationEntity extends BaseEntity {
    code: number;
    sku: string;
    color: string;
    size: string;
    model: string;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    weight_kg: number;
    min_stock: number;
    inventory: InventoryEntity[];
    product: FulfillmentProductEntity;
    product_id: string;
}
