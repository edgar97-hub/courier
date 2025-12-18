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
exports.OrderItemEntity = exports.PackageType = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
const orders_entity_1 = require("./orders.entity");
var PackageType;
(function (PackageType) {
    PackageType["STANDARD"] = "STANDARD";
    PackageType["CUSTOM"] = "CUSTOM";
})(PackageType || (exports.PackageType = PackageType = {}));
let OrderItemEntity = class OrderItemEntity extends base_entity_1.BaseEntity {
};
exports.OrderItemEntity = OrderItemEntity;
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PackageType,
        default: PackageType.CUSTOM,
        comment: 'Identifica si el paquete es de tamaño estándar o personalizado',
    }),
    __metadata("design:type", String)
], OrderItemEntity.prototype, "package_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: 'Descripción específica del paquete (ej. "Caja de Zapatos")',
    }),
    __metadata("design:type", String)
], OrderItemEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], OrderItemEntity.prototype, "width_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], OrderItemEntity.prototype, "length_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], OrderItemEntity.prototype, "height_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], OrderItemEntity.prototype, "weight_kg", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'base_price',
        type: 'float',
        comment: 'Costo del paquete sin descuentos, calculado por tarifa',
    }),
    __metadata("design:type", Number)
], OrderItemEntity.prototype, "basePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'final_price',
        type: 'float',
        comment: 'Costo final del paquete tras aplicar descuentos',
    }),
    __metadata("design:type", Number)
], OrderItemEntity.prototype, "finalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'is_principal',
        type: 'boolean',
        default: false,
        comment: 'Indica si este es el paquete principal (el más caro)',
    }),
    __metadata("design:type", Boolean)
], OrderItemEntity.prototype, "isPrincipal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => orders_entity_1.OrdersEntity, (order) => order.items, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", orders_entity_1.OrdersEntity)
], OrderItemEntity.prototype, "order", void 0);
exports.OrderItemEntity = OrderItemEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'order_items' })
], OrderItemEntity);
//# sourceMappingURL=order-item.entity.js.map