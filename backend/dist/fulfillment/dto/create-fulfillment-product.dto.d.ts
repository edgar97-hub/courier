export declare class CreateVariationDto {
    id?: string;
    sku: string;
    color?: string;
    size?: string;
    model?: string;
    length_cm?: number;
    width_cm?: number;
    height_cm?: number;
    weight_kg?: number;
    min_stock?: number;
}
export declare class CreateFulfillmentProductDto {
    name: string;
    description?: string;
    company_id: string;
    variations: CreateVariationDto[];
}
