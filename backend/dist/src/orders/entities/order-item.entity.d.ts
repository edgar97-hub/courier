import { BaseEntity } from '../../config/base.entity';
import { OrdersEntity } from './orders.entity';
export declare enum PackageType {
    STANDARD = "STANDARD",
    CUSTOM = "CUSTOM",
    FULFILLMENT = "FULFILLMENT"
}
export declare class OrderItemEntity extends BaseEntity {
    package_type: PackageType;
    description: string;
    width_cm: number;
    length_cm: number;
    height_cm: number;
    weight_kg: number;
    basePrice: number;
    finalPrice: number;
    isPrincipal: boolean;
    variationId?: string;
    productId?: string;
    quantity?: number;
    fulfillmentGroupId?: string;
    order: OrdersEntity;
}
