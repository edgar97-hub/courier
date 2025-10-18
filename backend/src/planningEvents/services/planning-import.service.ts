import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, Between, FindManyOptions, In } from 'typeorm';
import {
  PlanningEvent,
  PlanningEventStatus,
} from '../entities/planning-event.entity';
import { Route } from '../entities/route.entity';
import { Stop, StopStatus } from '../entities/stop.entity';
import { OrdersEntity } from '../../orders/entities/orders.entity';
import { STATES } from '../../constants/roles';
import { ImportResult } from '../dto/import-result.dto';
import { UsersEntity } from 'src/users/entities/users.entity';
import { UpdateLocationDto } from '../dto/update-location.dto';

@Injectable()
export class PlanningImportService {
  constructor(
    @InjectRepository(PlanningEvent)
    private planningEventRepository: Repository<PlanningEvent>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(Stop)
    private stopRepository: Repository<Stop>,
    @InjectRepository(OrdersEntity)
    private orderRepository: Repository<OrdersEntity>,
    private connection: Connection,
  ) {}

  async importPlanning(excelRows: any[]): Promise<ImportResult> {
    if (!excelRows || excelRows.length === 0) {
      return { success: false, message: 'No data provided in the Excel file.' };
    }

    let importedCount = 0;
    const errors: { rowExcel: number; message: string; rowData?: any }[] = [];

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let planningEvent = await queryRunner.manager.findOne(PlanningEvent, {
        where: {
          planningEventIdExternal: excelRows[0].ID_PLANIFICACION,
        },
        relations: ['routes'],
      });

      if (planningEvent) {
        let routeIds = planningEvent.routes.map((item) => item.id);
        await queryRunner.manager.delete(Route, {
          id: In(routeIds),
        });
        let stops = await queryRunner.manager.findBy(Stop, {
          routeId: In(routeIds),
        });
        if (stops) {
          let stopIds = stops.map((item) => item.id);
          await queryRunner.manager.delete(Stop, {
            id: In(stopIds),
          });
        }
      }

      for (let i = 0; i < excelRows.length; i++) {
        const row = excelRows[i];
        const excelRowNumber = i + 2; // +1 because it's 0-indexed, +1 because row 1 is header in Excel
        let rowHasErrors = false;

        // Basic validation for required fields
        if (!row.ID_PLANIFICACION) {
          errors.push({
            rowExcel: excelRowNumber,
            message: 'ID_PLANIFICACION is required.',
            rowData: row,
          });
          rowHasErrors = true;
        }
        if (!row.FECHA_PLANIFICACION) {
          errors.push({
            rowExcel: excelRowNumber,
            message: 'FECHA_PLANIFICACION is required.',
            rowData: row,
          });
          rowHasErrors = true;
        }
        if (!row.ID_RUTA_PLANIFICADOR) {
          errors.push({
            rowExcel: excelRowNumber,
            message: 'ID_RUTA_PLANIFICADOR is required.',
            rowData: row,
          });
          rowHasErrors = true;
        }
        if (!row.ID_PEDIDO) {
          errors.push({
            rowExcel: excelRowNumber,
            message: 'ID_PEDIDO is required.',
            rowData: row,
          });
          rowHasErrors = true;
        }
        if (!row.HORA_ESTIMADA_LLEGADA) {
          errors.push({
            rowExcel: excelRowNumber,
            message: 'HORA_ESTIMADA_LLEGADA is required.',
            rowData: row,
          });
          rowHasErrors = true;
        }

        if (!row.HORA_ESTIMADA_SALIDA) {
          errors.push({
            rowExcel: excelRowNumber,
            message: 'HORA_ESTIMADA_SALIDA is required.',
            rowData: row,
          });
          rowHasErrors = true;
        }

        if (rowHasErrors) {
          continue; // Skip to the next row if there are basic validation errors
        }

        try {
          // Find or create PlanningEvent
          let planningEvent = await queryRunner.manager.findOne(PlanningEvent, {
            where: {
              planningEventIdExternal: row.ID_PLANIFICACION,
              planningDate: row.FECHA_PLANIFICACION,
            },
          });

          if (!planningEvent) {
            planningEvent = queryRunner.manager.create(PlanningEvent, {
              planningEventIdExternal: row.ID_PLANIFICACION,
              planningDate: row.FECHA_PLANIFICACION,
              status: PlanningEventStatus.PENDING,
            });
            await queryRunner.manager.save(planningEvent);
          }

          // Find or create Route
          let route = await queryRunner.manager.findOne(Route, {
            where: {
              routeIdExternal: row.ID_RUTA_PLANIFICADOR,
              planningEvent: planningEvent,
            },
          });

          if (!route) {
            route = queryRunner.manager.create(Route, {
              routeIdExternal: row.ID_RUTA_PLANIFICADOR,
              driverCode: row.ID_CONDUCTOR,
              vehicle: row.VEHICULO,
              startingPoint: row.DIRECCION_INICIO_RUTA,
              completionPoint: row.DIRECCION_FINALIZACION_RUTA,
              vehicleStartTime: row.HORA_INICIO_RUTA,
              vehicleEndTime: row.HORA_FIN_RUTA,

              latitudeStartPoint: row.LATITUD_INICIO_RUTA,
              longitudeStartPoint: row.LONGITUD_INICIO_RUTA,
              planningEvent: { id: planningEvent.id },
              breakStart: row.HORA_ALMUERZO_RUTA,
              breakDuration: row.DURACION_ALMUERZO_RUTA,
            });
            await queryRunner.manager.save(route);
          }

          // Create Stop
          const stop = queryRunner.manager.create(Stop, {
            route: { id: route.id },
            orderCode: row.ID_PEDIDO,
            sequenceOrder: row.ORDEN_PARADA,
            address: row.DIRECCION_ENTREGA,
            plannedStartTime: row.HORA_ESTIMADA_LLEGADA,
            plannedEndTime: row.HORA_ESTIMADA_SALIDA,
            latitude: row.LATITUD_PARADA,
            longitude: row.LONGITUD_PARADA,
            status: StopStatus.PENDING,
          });
          await queryRunner.manager.save(stop);
          if (stop.orderCode && route.driverCode) {
            let order = await queryRunner.manager.findOne(OrdersEntity, {
              where: {
                code: Number(stop.orderCode),
              },
            });

            let driver = await queryRunner.manager.findOne(UsersEntity, {
              where: {
                driverCode: route.driverCode,
              },
            });
            if (order && driver) {
              order.assigned_driver = driver;
              await queryRunner.manager.save(order);
            }
          }

          importedCount++;
        } catch (individualError: any) {
          errors.push({
            rowExcel: excelRowNumber,
            message: `Error processing row: ${individualError.message}`,
            rowData: row,
          });
        }
      }

      if (errors.length > 0) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: `Import failed. ${errors.length} errors found. No planning events were saved.`,
          importedCount: 0,
          errors: errors,
        };
      } else {
        await queryRunner.commitTransaction();
        return {
          success: true,
          message: `¡Importación exitosa! ${importedCount} eventos de planificación se importaron exitosamente.`,
          importedCount: importedCount,
          errors: [],
        };
      }
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      return {
        success: false,
        message: `Critical error during import: ${err.message}. No planning events were saved.`,
        importedCount: 0,
        errors: errors.length > 0 ? errors : [{ message: err.message }],
      };
    } finally {
      await queryRunner.release();
    }
  }

  async getPlanningEvents(
    page_number: number,
    page_size: number,
    sort_field: string,
    sort_direction: 'asc' | 'desc',
    start_date?: string,
    end_date?: string,
    status?: string,
  ): Promise<{
    items: PlanningEvent[];
    total_count: number;
    page_number: number;
    page_size: number;
  }> {
    const queryBuilder = this.planningEventRepository
      .createQueryBuilder('planningEvent')
      .leftJoinAndSelect('planningEvent.routes', 'route')
      .leftJoinAndSelect('route.stops', 'stop')
      .leftJoinAndSelect('stop.order', 'order');

    if (start_date) {
      queryBuilder.andWhere('planningEvent.planningDate >= :startDate', {
        startDate: start_date,
      });
    }
    if (end_date) {
      queryBuilder.andWhere('planningEvent.planningDate <= :endDate', {
        endDate: end_date,
      });
    }
    if (status === PlanningEventStatus.COMPLETED) {
      queryBuilder.andWhere('order.status IN (:...status)', {
        status: [STATES.ANNULLED, STATES.DELIVERED, STATES.REJECTED],
      });
    }
    if (status === PlanningEventStatus.PENDING) {
      queryBuilder.andWhere('order.status NOT IN (:...status)', {
        status: [STATES.ANNULLED, STATES.DELIVERED, STATES.REJECTED],
      });
    }

    queryBuilder
      // .orderBy(
      //   `planningEvent.${sort_field}`,
      //   sort_direction.toUpperCase() as 'DESC' | 'ASC',
      // )
      .orderBy(`planningEvent.id`, 'DESC')
      .skip((page_number - 1) * page_size)
      .take(page_size);

    const [planningEvents, totalCount] = await queryBuilder.getManyAndCount();

    return {
      items: planningEvents,
      total_count: totalCount,
      page_number: page_number,
      page_size: page_size,
    };
  }

  async getPlanningEventDetails(id: number): Promise<PlanningEvent | null> {
    return this.planningEventRepository.findOne({
      where: { id },
      relations: [
        'routes',
        'routes.stops',
        'routes.stops.order',
        'routes.stops.order.company',
      ],
      order: {
        routes: {
          stops: {
            sequenceOrder: 'ASC',
          },
        },
      },
    });
  }

  // async updateStopStatus(id: number, status: StopStatus): Promise<void> {
  //   const queryRunner = this.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const stop = await queryRunner.manager.findOne(Stop, { where: { id } });
  //     if (!stop) {
  //       throw new Error('Stop not found');
  //     }

  //     stop.status = status;
  //     await queryRunner.manager.save(stop);

  //     const order = await queryRunner.manager.findOne(OrdersEntity, {
  //       where: { tracking_code: stop.orderCode },
  //     });
  //     if (order) {
  //       // Map StopStatus to OrderStatus (assuming a direct mapping or a conversion logic)
  //       // This is a placeholder, adjust according to your actual STATES enum and logic
  //       let newOrderStatus: STATES;
  //       switch (status) {
  //         case StopStatus.COMPLETED:
  //           newOrderStatus = STATES.DELIVERED; // Assuming 'DELIVERED' is a valid status in STATES
  //           break;
  //         case StopStatus.SKIPPED:
  //           newOrderStatus = STATES.CANCELED; // Assuming 'CANCELED' is a valid status in STATES
  //           break;
  //         default:
  //           newOrderStatus = STATES.REGISTERED; // Or another appropriate default
  //           break;
  //       }
  //       order.status = newOrderStatus;
  //       await queryRunner.manager.save(order);
  //     }

  //     await queryRunner.commitTransaction();
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     throw err;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
