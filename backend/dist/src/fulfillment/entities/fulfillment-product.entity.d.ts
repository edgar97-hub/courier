import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { ProductVariationEntity } from './product-variation.entity';
export declare class FulfillmentProductEntity extends BaseEntity {
    code: number;
    name: string;
    description: string;
    company: UsersEntity;
    company_id: string;
    variations: ProductVariationEntity[];
}
