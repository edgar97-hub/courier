"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanningEventModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cashManagement_module_1 = require("../cashManagement/cashManagement.module");
const planning_import_service_1 = require("./services/planning-import.service");
const planning_import_controller_1 = require("./controllers/planning-import.controller");
const routes_service_1 = require("./services/routes.service");
const routes_controller_1 = require("./controllers/routes.controller");
const planning_event_entity_1 = require("./entities/planning-event.entity");
const route_entity_1 = require("./entities/route.entity");
const stop_entity_1 = require("./entities/stop.entity");
const orders_entity_1 = require("../orders/entities/orders.entity");
let PlanningEventModule = class PlanningEventModule {
};
exports.PlanningEventModule = PlanningEventModule;
exports.PlanningEventModule = PlanningEventModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([planning_event_entity_1.PlanningEvent, route_entity_1.Route, stop_entity_1.Stop, orders_entity_1.OrdersEntity]),
            cashManagement_module_1.CashManagementModule,
        ],
        providers: [planning_import_service_1.PlanningImportService, routes_service_1.RoutesService],
        controllers: [planning_import_controller_1.PlanningImportController, routes_controller_1.RoutesController],
        exports: [planning_import_service_1.PlanningImportService, routes_service_1.RoutesService, typeorm_1.TypeOrmModule],
    })
], PlanningEventModule);
//# sourceMappingURL=planning-events.module.js.map