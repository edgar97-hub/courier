"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./services/orders.service");
const orders_controller_1 = require("./controllers/orders.controller");
const typeorm_1 = require("@nestjs/typeorm");
const orders_entity_1 = require("./entities/orders.entity");
const order_pdf_generator_service_1 = require("./services/order-pdf-generator.service");
const orderLog_entity_1 = require("./entities/orderLog.entity");
const cashManagement_module_1 = require("../cashManagement/cashManagement.module");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([orders_entity_1.OrdersEntity, orderLog_entity_1.OrderLogEntity]),
            cashManagement_module_1.CashManagementModule,
        ],
        providers: [orders_service_1.OrdersService, order_pdf_generator_service_1.OrderPdfGeneratorService],
        controllers: [orders_controller_1.OrdersController],
        exports: [orders_service_1.OrdersService, typeorm_1.TypeOrmModule],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map