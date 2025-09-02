import { Route } from './route.entity';
export declare enum PlanningEventStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class PlanningEvent {
    id: number;
    planningEventIdExternal: string;
    planningDate: string;
    status: PlanningEventStatus;
    routes: Route[];
}
