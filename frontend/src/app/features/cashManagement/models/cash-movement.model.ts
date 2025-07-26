export interface CashMovement {
  id: string;
  code?: string; // Added code property
  date?: string; // Changed to optional string
  amount: number;
  typeMovement: 'INGRESO' | 'EGRESO';
  paymentsMethod?: string;
  description?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface CreateCashMovement {
  date?: string; // Changed to optional string
  amount: number;
  typeMovement: 'INGRESO' | 'EGRESO';
  paymentsMethod?: string;
  description?: string;
  userId?: string;
}

export interface CashMovementQuery {
  startDate?: string;
  endDate?: string;
  typeMovement?: 'INGRESO' | 'EGRESO';
  paymentsMethod?: string;
  userId?: string;
  [key: string]: any; // Add index signature
}

export interface PaymentMethodSummary {
  income: number;
  expense: number;
  balance: number;
}

export interface DetailedCashMovementSummary {
  Efectivo: PaymentMethodSummary;
  'Yape/Transferencia BCP': PaymentMethodSummary;
  'Plin/Transferencia INTERBANK': PaymentMethodSummary;
  POS: PaymentMethodSummary;
  totalCashIncome: number;
  totalCashExpense: number;
  totalCashBalance: number;
}

export interface CashMovementPaginatedResponse {
  movements: CashMovement[];
  total: number;
}