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
exports.OrdersEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
const users_entity_1 = require("../../users/entities/users.entity");
const roles_1 = require("../../constants/roles");
const orderLog_entity_1 = require("./orderLog.entity");
let OrdersEntity = class OrdersEntity extends base_entity_1.BaseEntity {
};
exports.OrdersEntity = OrdersEntity;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Generated)('increment'),
    __metadata("design:type", Number)
], OrdersEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OrdersEntity.prototype, "shipment_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OrdersEntity.prototype, "recipient_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OrdersEntity.prototype, "recipient_phone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OrdersEntity.prototype, "delivery_district_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OrdersEntity.prototype, "delivery_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OrdersEntity.prototype, "delivery_coordinates", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OrdersEntity.prototype, "delivery_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OrdersEntity.prototype, "package_size_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], OrdersEntity.prototype, "package_width_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], OrdersEntity.prototype, "package_length_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], OrdersEntity.prototype, "package_height_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], OrdersEntity.prototype, "package_weight_kg", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], OrdersEntity.prototype, "shipping_cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    __metadata("design:type", String)
], OrdersEntity.prototype, "payment_method_for_shipping_cost", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OrdersEntity.prototype, "item_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], OrdersEntity.prototype, "amount_to_collect_at_delivery", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    __metadata("design:type", String)
], OrdersEntity.prototype, "payment_method_for_collection", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    __metadata("design:type", String)
], OrdersEntity.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    __metadata("design:type", String)
], OrdersEntity.prototype, "type_order_transfer_to_warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: roles_1.STATES,
        unique: false,
        default: roles_1.STATES.REGISTERED,
    }),
    __metadata("design:type", String)
], OrdersEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.UsersEntity, (user) => user.ordersIncludes),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", users_entity_1.UsersEntity)
], OrdersEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.UsersEntity, (user) => user.assignedDriversIncludes),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_driver_id' }),
    __metadata("design:type", users_entity_1.UsersEntity)
], OrdersEntity.prototype, "assigned_driver", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => orderLog_entity_1.OrderLogEntity, (log) => log.order),
    __metadata("design:type", Array)
], OrdersEntity.prototype, "logs", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], OrdersEntity.prototype, "tracking_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    __metadata("design:type", String)
], OrdersEntity.prototype, "product_delivery_photo_url", void 0);
exports.OrdersEntity = OrdersEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'orders' })
], OrdersEntity);
//# sourceMappingURL=orders.entity.js.map