export interface District {
  id: string | number; // Asumo que tienes un ID primario que viene del backend
  code?: number; // Podría ser un código visible, o usarse como ID si es único
  name: string;
  weight_from: number;
  weight_to: number;
  price: number;
  isStandard: boolean;
  isExpress?: boolean;
  surchargePercentage?: number;
  // Añade createdAt, updatedAt si los tienes y los necesitas mostrar/usar
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
