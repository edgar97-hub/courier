export interface ProductVariation {
  id?: string;
  code?: number;
  sku: string;
  color?: string;
  size?: string;
  model?: string;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  weight_kg?: number;
  min_stock?: number;
  product_id?: string;
}

export interface FulfillmentProduct {
  id: string;
  code: number;
  name: string;
  description?: string;
  company_id: string;
  company?: {
    id: string;
    code: number;
    username: string;
    business_name: string;
  };
  variations: ProductVariation[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFulfillmentProductDto {
  name: string;
  description?: string;
  company_id: string;
  variations: CreateVariationDto[];
}

export interface CreateVariationDto {
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
