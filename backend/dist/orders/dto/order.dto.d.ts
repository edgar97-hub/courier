import { STATES } from 'src/constants/roles';
import { PackageType } from '../entities/order-item.entity';
export declare class OrderItemDTO {
    package_type: PackageType;
    description: string;
    width_cm: number;
    length_cm: number;
    height_cm: number;
    weight_kg: number;
    basePrice: number;
    finalPrice?: number;
    isPrincipal?: boolean;
}
export declare class OrderDTO {
    shipment_type?: string;
    recipient_name?: string;
    recipient_phone: string;
    delivery_district_name: string;
    delivery_address: string;
    delivery_coordinates: string;
    delivery_date: string;
    items: OrderItemDTO[];
    shipping_cost: number;
    payment_method_for_shipping_cost: string;
    item_description: string;
    amount_to_collect_at_delivery: number;
    payment_method_for_collection: string;
    observations: string;
    type_order_transfer_to_warehouse: string;
    status: STATES;
    product_delivery_photo_url: string;
    tracking_code: string;
    isExpress?: string;
}
declare const UpdateOrderRequestDto_base: import("@nestjs/common").Type<Partial<OrderDTO>>;
export declare class UpdateOrderRequestDto extends UpdateOrderRequestDto_base {
    company_id?: string;
    observation_shipping_cost_modification?: string;
}
export {};
