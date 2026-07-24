import { OrderItem } from '../../models/order.model';

export interface FulfillmentItem {
  tempId: string;
  variationId: string;
  productId: string;
  productName: string;
  sku: string;
  color?: string;
  size?: string;
  model?: string;
  quantity: number;
  availableStock: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
}

export interface PackageGroup {
  tempId: string;
  items: FulfillmentItem[];
  totalWeight: number;
  maxLength: number;
  maxWidth: number;
  maxHeight: number;
  description: string;
  basePrice: number;
  finalPrice: number;
  isPrincipal: boolean;
}
