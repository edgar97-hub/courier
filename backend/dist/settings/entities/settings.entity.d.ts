import { BaseEntity } from '../../config/base.entity';
export interface PromotionalSetItem {
    id: string;
    imageUrl: string | null;
    linkUrl: string | null;
    buttonText: string | null;
    isActive?: boolean;
    order?: number;
}
export declare class SettingsEntity extends BaseEntity {
    business_name: string;
    ruc: string;
    address: string;
    phone_number: string;
    logo_url: string;
    terms_conditions_url: string;
    background_image_url: string;
    rates_image_url: string;
    excel_import_template_url: string;
    coverage_map_url: string;
    global_notice_image_url: string;
    promotional_sets: PromotionalSetItem[];
    standard_measurements_width: number;
    standard_measurements_height: number;
    standard_measurements_length: number;
    standard_measurements_weight: number;
    maximum_measurements_width: number;
    maximum_measurements_height: number;
    maximum_measurements_length: number;
    maximum_measurements_weight: number;
    volumetric_factor: number;
    googleMapsApiKey: string;
    multiPackageDiscountPercentage: number;
    multiPackageDiscountStartDate: Date | null;
    multiPackageDiscountEndDate: Date | null;
}
