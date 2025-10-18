// Define la estructura de un registro que recibimos del backend.
export interface DistributorRegistration {
  id: string; // o number, según tu backend
  creatorUserId: string;
  clientName: string;
  clientDni: string;
  clientPhone: string;
  destinationAddress: string;
  createdAt: Date;
  observation?: string;
  // Añade aquí cualquier otro campo que devuelva tu API, como el nombre del creador.
}
