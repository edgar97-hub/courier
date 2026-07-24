export enum KardexMovementType {
  INBOUND = 'INBOUND',
  ORDER_OUT = 'ORDER_OUT',
  MANUAL_ADD = 'MANUAL_ADD',
  MANUAL_SUBTRACT = 'MANUAL_SUBTRACT',
  ANNUL_REVERSAL = 'ANNUL_REVERSAL',
}

export interface KardexItem {
  id: string;
  createdAt: string;
  movement_type: KardexMovementType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  observation: string | null;
  responsible_user: string | null;
  reference_id: string | null;
  reference_type: string | null;
  variation: {
    id: string;
    sku: string;
    color: string;
    size: string;
    model: string;
    code: number;
    product_id: string;
  } | null;
  product: {
    id: string;
    name: string;
    code: number;
  } | null;
  company: {
    id: string;
    username: string;
    code: number;
  } | null;
  warehouse: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface PaginatedKardexResponse {
  items: KardexItem[];
  total_count: number;
  page_number: number;
  page_size: number;
}

export interface KardexParams {
  page_number: number;
  page_size: number;
  sort_field: string;
  sort_direction: 'ASC' | 'DESC';
  search_term: string;
  filter_company?: string;
  filter_company_id?: string;
  filter_product?: string;
  filter_sku?: string;
  filter_movement_type?: string;
  filter_date_from?: string;
  filter_date_to?: string;
  filter_responsible_user?: string;
  filter_observation?: string;
  filter_quantity_from?: number;
  filter_quantity_to?: number;
  filter_stock_after_from?: number;
  filter_stock_after_to?: number;
}
