export interface VolumeDiscountReportRow {
  date: string;
  clientName: string;
  clientId: string;
  totalOrders: number;
  rangeReached: string;
  discount: string;
  totalInvoiced: number;
  hasReachedMeta: boolean;
}

export interface VolumeDiscountReportParams {
  startDate: string;
  endDate: string;
  companyId?: string;
  statusMeta?: 'ALCANZADA' | 'NO_ALCANZADA';
}
