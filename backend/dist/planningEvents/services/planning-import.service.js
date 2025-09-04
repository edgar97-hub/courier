"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanningImportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const planning_event_entity_1 = require("../entities/planning-event.entity");
const route_entity_1 = require("../entities/route.entity");
const stop_entity_1 = require("../entities/stop.entity");
const orders_entity_1 = require("../../orders/entities/orders.entity");
const roles_1 = require("../../constants/roles");
let PlanningImportService = class PlanningImportService {
    constructor(planningEventRepository, routeRepository, stopRepository, orderRepository, connection) {
        this.planningEventRepository = planningEventRepository;
        this.routeRepository = routeRepository;
        this.stopRepository = stopRepository;
        this.orderRepository = orderRepository;
        this.connection = connection;
    }
    async importPlanning(excelRows) {
        if (!excelRows || excelRows.length === 0) {
            return { success: false, message: 'No data provided in the Excel file.' };
        }
        let importedCount = 0;
        const errors = [];
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (let i = 0; i < excelRows.length; i++) {
                const row = excelRows[i];
                const excelRowNumber = i + 2;
                let rowHasErrors = false;
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
                    continue;
                }
                try {
                    let planningEvent = await queryRunner.manager.findOne(planning_event_entity_1.PlanningEvent, {
                        where: {
                            planningEventIdExternal: row.ID_PLANIFICACION,
                            planningDate: row.FECHA_PLANIFICACION,
                        },
                    });
                    if (!planningEvent) {
                        planningEvent = queryRunner.manager.create(planning_event_entity_1.PlanningEvent, {
                            planningEventIdExternal: row.ID_PLANIFICACION,
                            planningDate: row.FECHA_PLANIFICACION,
                            status: planning_event_entity_1.PlanningEventStatus.PENDING,
                        });
                        await queryRunner.manager.save(planningEvent);
                    }
                    let route = await queryRunner.manager.findOne(route_entity_1.Route, {
                        where: {
                            routeIdExternal: row.ID_RUTA_PLANIFICADOR,
                            planningEvent: planningEvent,
                        },
                    });
                    if (!route) {
                        route = queryRunner.manager.create(route_entity_1.Route, {
                            routeIdExternal: row.ID_RUTA_PLANIFICADOR,
                            driverCode: row.ID_CONDUCTOR,
                            vehicle: row.VEHICULO,
                            startingPoint: row.PUNTO_INICIO_RUTA,
                            completionPoint: row.PUNTO_FINALIZACION_RUTA,
                            planningEvent: { id: planningEvent.id },
                        });
                        await queryRunner.manager.save(route);
                    }
                    const stop = queryRunner.manager.create(stop_entity_1.Stop, {
                        route: { id: route.id },
                        orderCode: row.ID_PEDIDO,
                        sequenceOrder: row.ORDEN_PARADA,
                        address: row.DIRECCION_ENTREGA,
                        plannedStartTime: row.HORA_ESTIMADA_LLEGADA,
                        plannedEndTime: row.HORA_ESTIMADA_SALIDA,
                        status: stop_entity_1.StopStatus.PENDING,
                    });
                    await queryRunner.manager.save(stop);
                    importedCount++;
                }
                catch (individualError) {
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
            }
            else {
                await queryRunner.commitTransaction();
                return {
                    success: true,
                    message: `¡Importación exitosa! ${importedCount} eventos de planificación se importaron exitosamente.`,
                    importedCount: importedCount,
                    errors: [],
                };
            }
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            return {
                success: false,
                message: `Critical error during import: ${err.message}. No planning events were saved.`,
                importedCount: 0,
                errors: errors.length > 0 ? errors : [{ message: err.message }],
            };
        }
        finally {
            await queryRunner.release();
        }
    }
    async getPlanningEvents(page_number, page_size, sort_field, sort_direction, start_date, end_date, status) {
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
        if (status) {
            queryBuilder.andWhere('planningEvent.status = :status', { status });
        }
        queryBuilder
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
    async getPlanningEventDetails(id) {
        return this.planningEventRepository.findOne({
            where: { id },
            relations: ['routes', 'routes.stops', 'routes.stops.order'],
        });
    }
    async updateStopStatus(id, status) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const stop = await queryRunner.manager.findOne(stop_entity_1.Stop, { where: { id } });
            if (!stop) {
                throw new Error('Stop not found');
            }
            stop.status = status;
            await queryRunner.manager.save(stop);
            const order = await queryRunner.manager.findOne(orders_entity_1.OrdersEntity, {
                where: { tracking_code: stop.orderCode },
            });
            if (order) {
                let newOrderStatus;
                switch (status) {
                    case stop_entity_1.StopStatus.COMPLETED:
                        newOrderStatus = roles_1.STATES.DELIVERED;
                        break;
                    case stop_entity_1.StopStatus.SKIPPED:
                        newOrderStatus = roles_1.STATES.CANCELED;
                        break;
                    default:
                        newOrderStatus = roles_1.STATES.REGISTERED;
                        break;
                }
                order.status = newOrderStatus;
                await queryRunner.manager.save(order);
            }
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.PlanningImportService = PlanningImportService;
exports.PlanningImportService = PlanningImportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(planning_event_entity_1.PlanningEvent)),
    __param(1, (0, typeorm_1.InjectRepository)(route_entity_1.Route)),
    __param(2, (0, typeorm_1.InjectRepository)(stop_entity_1.Stop)),
    __param(3, (0, typeorm_1.InjectRepository)(orders_entity_1.OrdersEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Connection])
], PlanningImportService);
//# sourceMappingURL=planning-import.service.js.map