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
}
