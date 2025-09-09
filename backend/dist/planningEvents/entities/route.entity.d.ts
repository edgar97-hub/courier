import { PlanningEvent } from './planning-event.entity';
import { Stop } from './stop.entity';
export declare class Route {
    id: number;
    routeIdExternal: string;
    driverCode: string;
    vehicle: string;
    vehicleStartTime: string;
    vehicleEndTime: string;
    startingPoint: string;
    completionPoint: string;
    latitudeStartPoint: string;
    longitudeStartPoint: string;
    latitudeEndPoint: string;
    longitudeEndPoint: string;
    planningEventId: number;
    planningEvent: PlanningEvent;
    stops: Stop[];
    breakStart: string;
    breakDuration: string;
}
