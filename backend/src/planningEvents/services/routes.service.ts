import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entities/route.entity';
import { Stop } from '../entities/stop.entity';
import { PlanningEvent } from '../entities/planning-event.entity';
import { OrdersEntity } from '../../orders/entities/orders.entity';
import { UsersEntity } from 'src/users/entities/users.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(Stop)
    private stopRepository: Repository<Stop>,
    @InjectRepository(PlanningEvent)
    private planningEventRepository: Repository<PlanningEvent>,
    @InjectRepository(OrdersEntity)
    private ordersRepository: Repository<OrdersEntity>,
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
  ) {}

  async findMyRoutesByDate(userId: string, date: string): Promise<Route[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const routes = await this.routeRepository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.planningEvent', 'planningEvent')
      .leftJoinAndSelect('route.stops', 'stop')
      .leftJoinAndSelect('stop.order', 'order')
      .where('planningEvent.planningDate = :date', { date })
      .andWhere('route.driverCode = :driverCode', {
        driverCode: user?.driverCode,
      })
      .orderBy('stop.sequenceOrder', 'ASC')
      .getMany();

    return routes;
  }
}
