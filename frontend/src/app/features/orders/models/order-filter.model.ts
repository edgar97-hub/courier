export interface OrderFilterCriteria {
  start_date?: string | null; 
  end_date?: string | null;  
  status?: string | null;
  search_term?: string | null;
  myOrders?: boolean;
  isExpress?: boolean;
  districts?: string[];
}
