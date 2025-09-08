// Asumiendo que tienes una interfaz base para User en algún lado, o la defines aquí
export interface TrackingUser {
  // Información mínima del usuario
  id: string | number;
  name?: string; // O el campo que uses para el nombre
}

export interface TrackingOrderLog {
  id: string | number; // Asumo que el log tiene un ID
  action: string; // Ej: "ESTADO_CAMBIADO", "REPROGRAMADO", "ASIGNACION_MOTORIZADO"
  previousValue?: string | null; // Estado anterior, fecha anterior, etc.
  newValue?: string | null; // Nuevo estado, nueva fecha, etc.
  notes?: string | null; // Motivo de reprogramación, detalles de incidencia
  performedBy?: TrackingUser | null; // Quién realizó la acción (si es relevante mostrarlo)
  createdAt: string | Date; // Fecha del log
  // order: any; // No es necesario anidar el pedido completo en cada log para el frontend de tracking
}

export interface TrackingOrder {
  id: string | number;
  code?: number;
  tracking_code: string; // El código que el usuario ingresará
  shipment_type?: string;
  recipient_name?: string;
  recipient_phone?: string; // Considerar si mostrarlo en tracking público
  delivery_district_name?: string;
  delivery_address?: string; // Considerar si mostrarla completa
  delivery_coordinates?: string; // Para el mapa
  delivery_date?: string | Date; // Fecha programada
  delivered_at?: string | Date; // Fecha real de entrega (si la tienes aparte del log)
  package_size_type?: string;
  item_description?: string;
  observations?: string; // Notas públicas del pedido
  status: string; // Viene de tu enum STATES
  logs: TrackingOrderLog[]; // El historial de tracking
  user?: { company_name?: string }; // Ejemplo: solo el nombre de la empresa del remitente
  stops: any;
}
