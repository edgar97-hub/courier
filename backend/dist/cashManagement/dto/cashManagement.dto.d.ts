import { TYPES_MOVEMENTS } from '../entities/cashManagement.entity';
export declare class CreateCashMovementDto {
    date?: string;
    amount: number;
    typeMovement: TYPES_MOVEMENTS;
    paymentsMethod?: string;
    description?: string;
    userId?: string;
}
export declare class QueryCashMovementDto {
    startDate?: string;
    endDate?: string;
    typeMovement?: TYPES_MOVEMENTS;
    paymentsMethod?: string;
    userId?: string;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
export declare class PaymentMethodSummary {
    income: number;
    expense: number;
    balance: number;
}
export declare class DetailedCashMovementSummaryDto {
    Efectivo: PaymentMethodSummary;
    'Yape/Transferencia BCP': PaymentMethodSummary;
    'Plin/Transferencia INTERBANK': PaymentMethodSummary;
    POS: PaymentMethodSummary;
    totalCashIncome: number;
    totalCashExpense: number;
    totalCashBalance: number;
}
