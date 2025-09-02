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
exports.RoutesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const route_entity_1 = require("../entities/route.entity");
const stop_entity_1 = require("../entities/stop.entity");
const planning_event_entity_1 = require("../entities/planning-event.entity");
const orders_entity_1 = require("../../orders/entities/orders.entity");
const users_entity_1 = require("../../users/entities/users.entity");
let RoutesService = class RoutesService {
    constructor(routeRepository, stopRepository, planningEventRepository, ordersRepository, userRepository) {
        this.routeRepository = routeRepository;
        this.stopRepository = stopRepository;
        this.planningEventRepository = planningEventRepository;
        this.ordersRepository = ordersRepository;
        this.userRepository = userRepository;
    }
    async findMyRoutesByDate(userId, date) {
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
};
exports.RoutesService = RoutesService;
exports.RoutesService = RoutesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(route_entity_1.Route)),
    __param(1, (0, typeorm_1.InjectRepository)(stop_entity_1.Stop)),
    __param(2, (0, typeorm_1.InjectRepository)(planning_event_entity_1.PlanningEvent)),
    __param(3, (0, typeorm_1.InjectRepository)(orders_entity_1.OrdersEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(users_entity_1.UsersEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RoutesService);
//# sourceMappingURL=routes.service.js.map