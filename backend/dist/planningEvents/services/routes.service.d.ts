import { Repository } from 'typeorm';
import { Route } from '../entities/route.entity';
import { Stop } from '../entities/stop.entity';
import { PlanningEvent } from '../entities/planning-event.entity';
import { OrdersEntity } from '../../orders/entities/orders.entity';
import { UsersEntity } from 'src/users/entities/users.entity';
export declare class RoutesService {
    private routeRepository;
    private stopRepository;
    private planningEventRepository;
    private ordersRepository;
    private userRepository;
    constructor(routeRepository: Repository<Route>, stopRepository: Repository<Stop>, planningEventRepository: Repository<PlanningEvent>, ordersRepository: Repository<OrdersEntity>, userRepository: Repository<UsersEntity>);
    findMyRoutesByDate(userId: string, date: string): Promise<Route[]>;
}
