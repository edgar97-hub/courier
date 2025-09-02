import { RoutesService } from '../services/routes.service';
import { GetMyRoutesDto } from '../dto/get-my-routes.dto';
export declare class RoutesController {
    private readonly routesService;
    constructor(routesService: RoutesService);
    getMyRoutesByDate(req: any, query: GetMyRoutesDto): Promise<import("../entities/route.entity").Route[]>;
}
