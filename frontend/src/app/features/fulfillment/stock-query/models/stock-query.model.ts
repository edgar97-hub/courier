export interface StockQueryItem {
  id: string;
  stock: number;
  warehouse_id: string;
  warehouse: {
    id: string;
    name: string;
    code: string;
  } | null;
  variation: {
    id: string;
    sku: string;
    color: string;
    size: string;
    model: string;
    min_stock: number;
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
}

export interface PaginatedStockQueryResponse {
  items: StockQueryItem[];
  total_count: number;
  page_number: number;
  page_size: number;
}

export interface StockQueryParams {
  page_number: number;
  page_size: number;
  sort_field: string;
  sort_direction: 'ASC' | 'DESC';
  search_term: string;
  filter_company?: string;
  filter_company_id?: string;
  filter_product?: string;
  filter_sku?: string;
  filter_color?: string;
  filter_size?: string;
  filter_model?: string;
  filter_stock_from?: number;
  filter_stock_to?: number;
  filter_min_stock_from?: number;
  filter_min_stock_to?: number;
}
