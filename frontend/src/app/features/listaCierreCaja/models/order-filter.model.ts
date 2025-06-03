export interface OrderFilterCriteria {
  start_date?: string | null; // Formato YYYY-MM-DD esperado por la API
  end_date?: string | null; // Formato YYYY-MM-DD esperado por la API
  delivery_date?: string | null; // Formato YYYY-MM-DD esperado por la API
  status?: string | null;
  search_term?: string | null;
}
