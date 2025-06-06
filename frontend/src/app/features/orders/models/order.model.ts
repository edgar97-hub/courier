import { User } from '../../../shared/models/user';

export interface Order {
  id: number | string;
  code: number | string;
  type: string; // Considera si este campo también es snake_case desde la API (ej. order_type)
  recipient_name: string;
  recipient_phone: string;
  district: string;
  registration_date: string | Date; // La API probablemente devuelva string
  delivery_date: string | Date; // La API probablemente devuelva string
  status: string; // Considera si este campo también es snake_case desde la API (ej. order_status)
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

// Para los datos que se envían al backend al crear UN pedido individual
// (antes de agruparlos en el lote final)
export interface NewOrderData {
  // id?: string | number; // El ID lo asigna el backend, o un ID temporal en frontend
  shipment_type: string; // ej: 'SOLO_ENTREGA_NO_COBRAR'
  recipient_name: string;
  recipient_phone: string;
  delivery_district_id: string | number; // El ID del distrito
  delivery_address: string;
  delivery_coordinates?: string; // Formato "lat,lng"
  delivery_date: string; // Formato YYYY-MM-DD

  package_size_type: 'standard' | 'custom';
  package_width_cm?: number | null;
  package_length_cm?: number | null;
  package_height_cm?: number | null;
  package_weight_kg?: number | null;
  shipping_cost: number; // Calculado o fijo para estándar

  item_description: string; // "¿Qué envía?"
  amount_to_collect_at_delivery: number;
  payment_method_for_collection: string; // ej: 'NO_COBRAR', 'EFECTIVO'
  observations?: string;

  // Para mostrar en la tabla temporal
  delivery_district_name?: string; // Nombre del distrito para UI
  temp_id?: string; // ID temporal para la lista local

  // para el cliente
  company_id?: string;
}

// Para el payload final que se envía al backend con el lote de pedidos
export interface CreateBatchOrderPayload {
  orders: Omit<NewOrderData, 'delivery_district_name' | 'temp_id'>[]; // Array de los pedidos sin los campos temporales de UI
  pickup_option: string; // ej: 'RECOGER_DOMICILIO'
  terms_accepted: boolean;
}

// Para las opciones de distrito de la API
export interface DistrictOption {
  id: string | number;
  name: string;
  isStandard: boolean;
  price: string;
  name_and_price?: string;
  // coverage_info?: string; // "En caso de registrar el pedido, no verificar..."
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

// Suponiendo que tienes algo así en tus modelos
export enum STATES {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
}

export enum OrderStatus {
  REGISTRADO = 'REGISTRADO',
  RECOGIDO = 'RECOGIDO',
  // PENDIENTE = 'PENDIENTE',
  // CONFIRMADO = 'CONFIRMADO',
  // EN_PREPARACION = 'EN_PREPARACION',
  // LISTO_PARA_RECOGER = 'LISTO_PARA_RECOGER',
  EN_ALMACEN = 'EN ALMACEN',
  EN_TRANSITO = 'EN TRANSITO',
  ENTREGADO = 'ENTREGADO',
  // NO_ENTREGADO = 'NO_ENTREGADO',
  CANCELADO = 'CANCELADO',
  RECHAZADO = 'RECHAZADO EN PUNTO',
  // INCIDENCIA = 'INCIDENCIA',
  REPROGRAMADO = 'REPROGRAMADO',
}

export interface Order_importacion {
  id?: string; // Opcional, el backend lo asigna
  recipient_name?: string;
  recipient_phone: string;
  delivery_district_name: string; // Este será el que el usuario selecciona de la lista
  delivery_address: string;
  delivery_coordinates?: string; // Lat,Lng (opcional, podrías obtenerlo de la dirección)
  delivery_date: string; // Formato "YYYY-MM-DD" o "DD/MM/YYYY" (consistencia es clave)
  // package_size_type: string; // No está directamente en tu Excel, se infiere o calcula?
  package_width_cm?: number; // Estos podrían no estar en tu Excel de importación masiva
  package_length_cm?: number; // o estar agrupados en 'DETALLE DEL PRODUCTO'
  package_height_cm?: number;
  package_weight_kg?: number;
  shipping_cost?: number; // ¿Se calcula o se ingresa?
  item_description: string; // Corresponde a "DETALLE DEL PRODUCTO"
  amount_to_collect_at_delivery?: number; // Corresponde a "MONTO A COBRAR"
  payment_method_for_collection?: string; // Corresponde a "FORMA DE PAGO"
  observations?: string;
  type_order_transfer_to_warehouse: string; // Corresponde a "TIPO DE ENVIO"
  status?: STATES; // El estado inicial podría ser "Pending"
}

export interface Order_ {
  id: string | number; // Asumo que tienes un ID primario que no está en la lista, pero es esencial
  code?: number; // Este podría ser un ID secundario o número de orden visible
  shipment_type?: string;
  recipient_name?: string;
  recipient_phone?: string;
  delivery_district_name?: string;
  delivery_address?: string;
  delivery_coordinates?: string; // Formato "lat,lng"
  delivery_date?: string; // Considera usar Date si la API devuelve un formato ISO
  package_size_type?: string;
  package_width_cm?: number;
  package_length_cm?: number;
  package_height_cm?: number;
  package_weight_kg?: number;
  item_description?: string; // Descripción del contenido
  shipping_cost?: number;
  payment_method_for_shipping_cost?: string;
  amount_to_collect_at_delivery?: number;
  payment_method_for_collection?: string;
  observations?: string; // Notas del cliente o internas
  type_order_transfer_to_warehouse?: string;
  status: OrderStatus; // Usando el enum
  user?: User; // Información básica del usuario que creó la orden
  assigned_driver?: User;
  createdAt?: string | Date; // Fecha de creación
  updatedAt?: string | Date; // Fecha de última actualización
  delivered_at?: string | Date; // Fecha real de entrega (si la tienes)
  product_delivery_photo_url?: string;
}

export interface Motorized {
  assigned_driver_id?: string | number | null;
  assigned_driver_name?: string;
  assigned_driver?: User | null;
}
