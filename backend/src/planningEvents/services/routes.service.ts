import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entities/route.entity';
import { Stop } from '../entities/stop.entity';
import { PlanningEvent } from '../entities/planning-event.entity';
import { OrdersEntity } from '../../orders/entities/orders.entity';
import { UsersEntity } from 'src/users/entities/users.entity';
import { UpdateLocationDto } from '../dto/update-location.dto';

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
      .leftJoinAndSelect('order.company', 'user')
      .where('planningEvent.planningDate = :date', { date })
      .andWhere('route.driverCode = :driverCode', {
        driverCode: user?.driverCode,
      })
      .orderBy('stop.sequenceOrder', 'ASC')
      .getMany();

    return routes;
  }

   /**
     * Actualiza la última ubicación conocida de una ruta.
     * Este método será llamado por la app del motorizado.
     */
    public async updateRouteLocation(routeId: number, dto: UpdateLocationDto): Promise<void> {
      try {
        // Usamos 'update' para una operación más rápida y directa.
        // No necesitamos cargar la entidad completa.
        const result = await this.routeRepository.update(routeId, {
          currentLatitude: dto.latitude,
          currentLongitude: dto.longitude,
          lastLocationUpdate: new Date(), // Guardamos la hora actual del servidor
        });
  
        if (result.affected === 0) {
          throw new NotFoundException(`Ruta con ID ${routeId} no encontrada.`);
        }
      } catch (error) {
        // Re-lanzar el error para que el controlador lo maneje
        throw error;
      }
    }
  
    /**
     * Obtiene las ubicaciones en tiempo real de todas las rutas de un evento de planificación.
     * Este método será llamado por el panel del administrador.
     */
    public async getLiveRouteLocations(planningEventId: number): Promise<any[]> {
      try {
        const routes = await this.routeRepository.find({
          where: { planningEventId: planningEventId },
          select: [ // Seleccionamos solo los campos que necesitamos para optimizar la consulta
            'id',
            'driverCode',
            'vehicle',
            'currentLatitude',
            'currentLongitude',
            'lastLocationUpdate',
          ],
        });
  
        // Devolvemos solo los datos relevantes para el frontend
        return routes.map(route => ({
          routeId: route.id,
          driverCode: route.driverCode,
          vehicle: route.vehicle,
          latitude: route.currentLatitude,
          longitude: route.currentLongitude,
          lastUpdate: route.lastLocationUpdate,
        }));
      } catch (error) {
        throw error;
      }
    }
}
