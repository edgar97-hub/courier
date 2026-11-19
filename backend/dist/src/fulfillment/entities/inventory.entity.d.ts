import { BaseEntity } from '../../config/base.entity';
import { WarehouseEntity } from './warehouse.entity';
import { ProductVariationEntity } from './product-variation.entity';
export declare class InventoryEntity extends BaseEntity {
    stock: number;
    warehouse: WarehouseEntity;
    warehouse_id: string;
    variation: ProductVariationEntity;
    variation_id: string;
}
