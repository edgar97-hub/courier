import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from 'src/users/entities/users.entity';
import { OrdersEntity } from 'src/orders/entities/orders.entity';
export declare enum TYPES_MOVEMENTS {
    INCOME = "INGRESO",
    OUTCOME = "EGRESO"
}
export declare class CashManagementEntity extends BaseEntity {
    code: number;
    date?: string;
    amount: number;
    typeMovement: TYPES_MOVEMENTS;
    paymentsMethod?: string;
    description?: string;
    user: UsersEntity;
    order: OrdersEntity;
}
