import { User } from '../../../shared/models/user';

export interface Order {
  id: number | string;
  code: number | string;
  type: string;
  recipient_name: string;
  recipient_phone: string;
  district: string;
  registration_date: string | Date;
  delivery_date: string | Date;
  status: string;
  amount_to_collect: number;
  service_amount: number;
  tracking_code?: string;
}

export interface PaginatedOrdersResponse {
  items: Order_[];
  total_count?: number;
  page_number?: number;
  page_size?: number;
}

export interface NewOrderData {
  // id?: string | number; 
  isExpress?: boolean;
  shipment_type: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_district_id: string | number;
  delivery_address: string;
  delivery_coordinates?: string;
  delivery_date: string; 

  package_size_type: 'standard' | 'custom';
  package_width_cm?: number | null;
  package_length_cm?: number | null;
  package_height_cm?: number | null;
  package_weight_kg?: number | null;
  shipping_cost: number;

  item_description: string;
  amount_to_collect_at_delivery: number;
  payment_method_for_collection: string;
  observations?: string;

  // Para mostrar en la tabla temporal
  delivery_district_name?: string;
  temp_id?: string;
  company_id?: string;
}

// Para el payload final que se envía al backend con el lote de pedidos
export interface CreateBatchOrderPayload {
  orders: Omit<NewOrderData, 'delivery_district_name' | 'temp_id'>[];
  pickup_option: string;
  terms_accepted: boolean;
}

// Para las opciones de distrito de la API
export interface DistrictOption {
  id: string | number;
  name: string;
  isStandard: boolean;
  price: string;
  name_and_price?: string;
  isExpress?: boolean;
}

export interface MaxPackageDimensions {
  max_length_cm: number;
  max_width_cm: number;
  max_height_cm: number;
  max_weight_kg: number;

  sta_length_cm?: number;
  sta_width_cm?: number;
  sta_height_cm?: number;
  sta_weight_kg?: number;

  volumetric_factor?: number;
  standard_package_info?: string;
  info_text?: string;
}

export interface ShippingCostResponse {
  shipping_cost: number;
}

export enum STATES {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
}

export enum OrderStatus {
  REGISTRADO = 'REGISTRADO',
  RECOGIDO = 'RECOGIDO',
  EN_ALMACEN = 'EN ALMACEN',
  EN_TRANSITO = 'EN TRANSITO',
  ENTREGADO = 'ENTREGADO',
  RECHAZADO = 'RECHAZADO EN PUNTO',
  ANULADO = 'ANULADO',
  REPROGRAMADO = 'REPROGRAMADO',
}

export interface Order_importacion {
  id?: string;
  recipient_name?: string;
  recipient_phone: string;
  delivery_district_name: string;
  delivery_address: string;
  delivery_coordinates?: string;
  delivery_date: string;
  // package_size_type: string; // No está directamente en tu Excel, se infiere o calcula?
  package_width_cm?: number;
  package_length_cm?: number;
  package_height_cm?: number;
  package_weight_kg?: number;
  shipping_cost?: number;
  item_description: string;
  amount_to_collect_at_delivery?: number;
  payment_method_for_collection?: string;
  observations?: string;
  type_order_transfer_to_warehouse: string;
  status?: STATES;
}

export interface Order_ {
  id: string | number;
  code?: number;
  shipment_type?: string;
  recipient_name?: string;
  recipient_phone?: string;
  delivery_district_name?: string;
  delivery_address?: string;
  delivery_coordinates?: string;
  delivery_date?: string;
  package_size_type?: string;
  package_width_cm?: number;
  package_length_cm?: number;
  package_height_cm?: number;
  package_weight_kg?: number;
  item_description?: string;
  shipping_cost?: number;
  payment_method_for_shipping_cost?: string;
  amount_to_collect_at_delivery?: number;
  payment_method_for_collection?: string;
  observations?: string;
  type_order_transfer_to_warehouse?: string;
  status: OrderStatus;
  user?: User;
  company?: User;
  assigned_driver?: User;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  delivered_at?: string | Date;
  product_delivery_photo_url?: string;
  observation_shipping_cost_modification?: string;
  isExpress?: boolean;
}

export interface Motorized {
  assigned_driver_id?: string | number | null;
  assigned_driver_name?: string;
  assigned_driver?: User | null;
}

export interface UpdateOrderRequestDto {
  isExpress?: boolean;
  recipient_name?: string;
  recipient_phone?: string;
  delivery_district_name?: string;
  delivery_address?: string;
  package_size_type?: string;
  package_width_cm?: number;
  package_length_cm?: number;
  package_height_cm?: number;
  package_weight_kg?: number;
  shipping_cost?: number;
  item_description?: string;
  observations?: string;
  company_id?: string;
  observation_shipping_cost_modification?: string;
}
