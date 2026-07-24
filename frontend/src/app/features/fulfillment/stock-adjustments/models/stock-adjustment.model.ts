export enum AdjustmentType {
  INBOUND = 'INBOUND',
  MANUAL_ADD = 'MANUAL_ADD',
  MANUAL_SUBTRACT = 'MANUAL_SUBTRACT',
}

export enum AdjustmentStatus {
  REGISTERED = 'REGISTERED',
  ANNULLED = 'ANNULLED',
}

export interface StockAdjustment {
  id: string;
  code: number;
  adjustment_type: AdjustmentType;
  quantity: number;
  observation: string;
  status: AdjustmentStatus;
  company_id: string;
  company?: {
    id: string;
    code: number;
    username: string;
    business_name: string;
  };
  product_id: string;
  product?: {
    id: string;
    code: number;
    name: string;
  };
  variation_id: string;
  variation?: {
    id: string;
    code: number;
    sku: string;
    color?: string;
    size?: string;
    model?: string;
  };
  warehouse_id: string;
  warehouse?: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockAdjustmentDto {
  adjustment_type: AdjustmentType;
  quantity: number;
  observation: string;
  company_id: string;
  product_id: string;
  variation_id: string;
  warehouse_id: string;
  responsible_user?: string;
}

export interface PaginatedAdjustmentsResponse {
  items: StockAdjustment[];
  total_count: number;
  page_number: number;
  page_size: number;
}

export interface PaginatedAdjustmentsParams {
  page_number?: number;
  page_size?: number;
  sort_field?: string;
  sort_direction?: 'ASC' | 'DESC';
  search_term?: string;
}
