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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderLogEntity = exports.ORDER_LOG_ACTIONS = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
const users_entity_1 = require("../../users/entities/users.entity");
const orders_entity_1 = require("./orders.entity");
var ORDER_LOG_ACTIONS;
(function (ORDER_LOG_ACTIONS) {
    ORDER_LOG_ACTIONS["STATUS_CHANGE"] = "STATUS_CHANGE";
    ORDER_LOG_ACTIONS["REPROGRAMMED"] = "REPROGRAMMED";
    ORDER_LOG_ACTIONS["DRIVER_ASSIGNED"] = "DRIVER_ASSIGNED";
    ORDER_LOG_ACTIONS["ADDRESS_UPDATED"] = "ADDRESS_UPDATED";
    ORDER_LOG_ACTIONS["ORDER_CREATED"] = "ORDER_CREATED";
    ORDER_LOG_ACTIONS["ORDER_CANCELED"] = "ORDER_CANCELED";
})(ORDER_LOG_ACTIONS || (exports.ORDER_LOG_ACTIONS = ORDER_LOG_ACTIONS = {}));
let OrderLogEntity = class OrderLogEntity extends base_entity_1.BaseEntity {
};
exports.OrderLogEntity = OrderLogEntity;
__decorate([
    (0, typeorm_1.ManyToOne)(() => orders_entity_1.OrdersEntity, (order) => order.logs, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", orders_entity_1.OrdersEntity)
], OrderLogEntity.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.UsersEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'performed_by' }),
    __metadata("design:type", users_entity_1.UsersEntity)
], OrderLogEntity.prototype, "performedBy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OrderLogEntity.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], OrderLogEntity.prototype, "previousValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], OrderLogEntity.prototype, "newValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], OrderLogEntity.prototype, "notes", void 0);
exports.OrderLogEntity = OrderLogEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'order_logs' })
], OrderLogEntity);
//# sourceMappingURL=orderLog.entity.js.map