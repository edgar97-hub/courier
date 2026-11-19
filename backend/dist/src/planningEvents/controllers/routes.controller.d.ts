import { RoutesService } from '../services/routes.service';
import { GetMyRoutesDto } from '../dto/get-my-routes.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
export declare class RoutesController {
    private readonly routesService;
    constructor(routesService: RoutesService);
    getMyRoutesByDate(req: any, query: GetMyRoutesDto): Promise<import("../entities/route.entity").Route[]>;
    updateRouteLocation(routeId: number, updateLocationDto: UpdateLocationDto): Promise<void>;
    getLiveRouteLocations(id: number): Promise<any[]>;
}
