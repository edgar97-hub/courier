export interface DistributorRegistration {
  id: string;
  creatorUserId: string;
  clientName: string;
  clientDni: string;
  clientPhone: string;
  destinationAddress: string;
  createdAt: Date;
  observation?: string;
}
