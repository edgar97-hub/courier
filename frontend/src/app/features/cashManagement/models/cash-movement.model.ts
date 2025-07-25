export interface CashMovement {
  id: string;
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

export interface CashMovementSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CashMovementPaginatedResponse {
  movements: CashMovement[];
  total: number;
}