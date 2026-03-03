export interface PromotionalSetItem {
  id: string;
  imageUrl: string | null;
  linkUrl: string | null;
  buttonText: string | null;
  isActive?: boolean;
  order?: number;
  imageFile?: File | null;
  imagePreviewUrl?: string | null;
}

export enum DiscountRuleType {
  RANGE = 'RANGE', // Progresivo: solo aplica dentro del rango (ej. 10 al 20)
  GOAL = 'GOAL', // Meta/Retroactivo: aplica a todos desde el 1 al llegar a X
}

export interface VolumeDiscountRule {
  id: string;
  type: DiscountRuleType;
  minOrders: number;
  maxOrders?: number;
  discountPercentage: number;
  startDate: Date | string | null;
  endDate: Date | string | null;
  isActive: boolean;
}

export interface AppSettings {
  id?: string;
  business_name: string | null;
  ruc: string | null;
  address: string | null;
  phone_number: string | null;
  logo_url: string | null;
  terms_conditions_url: string | null;
  background_image_url: string | null;
  rates_image_url: string | null;
  excel_import_template_url: string | null;
  coverage_map_url: string | null;
  global_notice_image_url: string | null;
  promotional_sets: PromotionalSetItem[];
  googleMapsApiKey?: string;
  multiPackageDiscountPercentage: number;
  multiPackageDiscountStartDate: number | null;
  multiPackageDiscountEndDate: number | null;
  volumeDiscountRules: VolumeDiscountRule[];
}

export const initialAppSettings: AppSettings = {
  business_name: null,
  ruc: null,
  address: null,
  phone_number: null,
  logo_url: null,
  terms_conditions_url: null,
  background_image_url: null,
  rates_image_url: null,
  excel_import_template_url: null,
  coverage_map_url: null,
  global_notice_image_url: null,
  promotional_sets: [],

  multiPackageDiscountPercentage: 0,
  multiPackageDiscountStartDate: null,
  multiPackageDiscountEndDate: null,
  volumeDiscountRules: [],
};
