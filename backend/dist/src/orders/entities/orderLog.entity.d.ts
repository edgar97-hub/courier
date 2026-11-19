import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { OrdersEntity } from './orders.entity';
export declare enum ORDER_LOG_ACTIONS {
    STATUS_CHANGE = "STATUS_CHANGE",
    REPROGRAMMED = "REPROGRAMMED",
    DRIVER_ASSIGNED = "DRIVER_ASSIGNED",
    ADDRESS_UPDATED = "ADDRESS_UPDATED",
    ORDER_CREATED = "ORDER_CREATED",
    ORDER_CANCELED = "ORDER_CANCELED"
}
export declare class OrderLogEntity extends BaseEntity {
    order: OrdersEntity;
    performedBy?: UsersEntity;
    action: string;
    previousValue?: string;
    newValue?: string;
    notes?: string;
}
