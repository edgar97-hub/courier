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
exports.CashManagementEntity = exports.TYPES_MOVEMENTS = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
const users_entity_1 = require("../../users/entities/users.entity");
const orders_entity_1 = require("../../orders/entities/orders.entity");
var TYPES_MOVEMENTS;
(function (TYPES_MOVEMENTS) {
    TYPES_MOVEMENTS["INCOME"] = "INGRESO";
    TYPES_MOVEMENTS["OUTCOME"] = "EGRESO";
})(TYPES_MOVEMENTS || (exports.TYPES_MOVEMENTS = TYPES_MOVEMENTS = {}));
let CashManagementEntity = class CashManagementEntity extends base_entity_1.BaseEntity {
};
exports.CashManagementEntity = CashManagementEntity;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Generated)('increment'),
    __metadata("design:type", Number)
], CashManagementEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'date' }),
    __metadata("design:type", String)
], CashManagementEntity.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], CashManagementEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TYPES_MOVEMENTS,
        unique: false,
        default: TYPES_MOVEMENTS.INCOME,
    }),
    __metadata("design:type", String)
], CashManagementEntity.prototype, "typeMovement", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    __metadata("design:type", String)
], CashManagementEntity.prototype, "paymentsMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    __metadata("design:type", String)
], CashManagementEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.UsersEntity, (user) => user.cashManagementIncludes),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", users_entity_1.UsersEntity)
], CashManagementEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => orders_entity_1.OrdersEntity, (order) => order.cashManagementIncludes),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", orders_entity_1.OrdersEntity)
], CashManagementEntity.prototype, "order", void 0);
exports.CashManagementEntity = CashManagementEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'cash_management' })
], CashManagementEntity);
//# sourceMappingURL=cashManagement.entity.js.map