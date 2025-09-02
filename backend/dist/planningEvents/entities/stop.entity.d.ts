import { Route } from './route.entity';
import { OrdersEntity } from '../../orders/entities/orders.entity';
export declare enum StopStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    SKIPPED = "SKIPPED"
}
export declare class Stop {
    id: number;
    sequenceOrder: number;
    plannedArrivalTime: string;
    address: string;
    status: StopStatus;
    routeId: number;
    route: Route;
    orderCode: string;
    order: OrdersEntity;
}
