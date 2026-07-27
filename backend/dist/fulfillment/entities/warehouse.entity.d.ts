import { BaseEntity } from '../../config/base.entity';
import { InventoryEntity } from './inventory.entity';
export declare class WarehouseEntity extends BaseEntity {
    name: string;
    code: string;
    is_main: boolean;
    inventory: InventoryEntity[];
}
