export enum PlanningEventStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface PlanningEvent {
  id: number;
  planningEventIdExternal: string;
  planningDate: Date;
  status: PlanningEventStatus;
  routes: Route[];
  total_routes?: number; // Added for convenience in frontend
  total_stops?: number; // Added for convenience in frontend
}

export interface Route {
  id: number;
  routeIdExternal: string;
  planningEventId: number;
  stops: Stop[];
  driverCode: string;
  vehicle: string;
  startingPoint: string;
  completionPoint: string;

  latitudeStartPoint: string;
  longitudeEndPoint: string;

  vehicleStartTime?: string;
  vehicleEndTime?: string;
  breakStart?: string;
  breakDuration?: string;
}

export interface Stop {
  id: number;
  routeId: number;
  orderCode: string;
  sequenceOrder: number;
  plannedStartTime: string;
  plannedEndTime: string;
  status: StopStatus;
  address: string;
  latitude: string;
  longitude: string;
  notes: string;
  order: any;
}

export enum StopStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  INCIDENCIA = 'INCIDENCIA',
}

export interface PaginatedPlanningEventsResponse {
  items: PlanningEvent[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface PlanningEvent_importacion {
  id_planificacion: string;
  fecha_planificacion: string;
  id_ruta_planificador: string;
  id_conductor: string;
  orden_parada: number;
  id_pedido: string;
  direccion_entrega: string;
  hora_estimada_llegada: string;
}
