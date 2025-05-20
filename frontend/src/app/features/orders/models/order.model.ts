export interface Order {
  id: number | string;
  type: string; // Considera si este campo también es snake_case desde la API (ej. order_type)
  recipient_name: string;
  recipient_phone: string;
  district: string;
  registration_date: string | Date; // La API probablemente devuelva string
  delivery_date: string | Date; // La API probablemente devuelva string
  status: string; // Considera si este campo también es snake_case desde la API (ej. order_status)
  amount_to_collect: number;
  service_amount: number;
}

export interface PaginatedOrdersResponse {
  // Nombrado más genérico para la respuesta de la API
  items: Order[];
  total_count: number;
  page_number: number;
  page_size: number;
  // Agrega cualquier otra propiedad que tu API devuelva para la paginación
  // total_pages?: number;
  // has_next_page?: boolean;
  // has_previous_page?: boolean;
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
  // Campos para 'custom'
  package_width_cm?: number | null;
  package_length_cm?: number | null;
  package_height_cm?: number | null;
  package_weight_kg?: number | null;
  // Campos para 'standard' (se podrían obtener de config o ser fijos)
  // standard_package_dimensions?: string; // ej: "30cmx15cmx20cm 1.5kg"

  shipping_cost: number; // Calculado o fijo para estándar

  item_description: string; // "¿Qué envía?"
  amount_to_collect_at_delivery: number;
  payment_method_for_collection: string; // ej: 'NO_COBRAR', 'EFECTIVO'
  observations?: string;

  // Para mostrar en la tabla temporal
  delivery_district_name?: string; // Nombre del distrito para UI
  temp_id?: string; // ID temporal para la lista local
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

  standard_package_info?: string;
  info_text?: string;
}

export interface ShippingCostResponse {
  shipping_cost: number;
}
