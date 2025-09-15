import { STATES } from 'src/constants/roles';
export declare class OrderDTO {
    shipment_type?: string;
    recipient_name?: string;
    recipient_phone: string;
    delivery_district_name: string;
    delivery_address: string;
    delivery_coordinates: string;
    delivery_date: string;
    package_size_type: string;
    package_width_cm: number;
    package_length_cm: number;
    package_height_cm: number;
    package_weight_kg: number;
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
}
declare const UpdateOrderRequestDto_base: import("@nestjs/common").Type<Partial<OrderDTO>>;
export declare class UpdateOrderRequestDto extends UpdateOrderRequestDto_base {
    recipient_name?: string;
    recipient_phone?: string;
    delivery_district_name?: string;
    delivery_address?: string;
    package_size_type?: string;
    package_width_cm?: number;
    package_length_cm?: number;
    package_height_cm?: number;
    package_weight_kg?: number;
    shipping_cost?: number;
    item_description?: string;
    observations?: string;
    company_id?: string;
    observation_shipping_cost_modification?: string;
}
export {};
