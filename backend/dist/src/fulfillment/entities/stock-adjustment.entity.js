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
exports.StockAdjustmentEntity = exports.ADJUSTMENT_STATUS = exports.ADJUSTMENT_TYPE = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
const users_entity_1 = require("../../users/entities/users.entity");
const fulfillment_product_entity_1 = require("./fulfillment-product.entity");
const product_variation_entity_1 = require("./product-variation.entity");
const warehouse_entity_1 = require("./warehouse.entity");
var ADJUSTMENT_TYPE;
(function (ADJUSTMENT_TYPE) {
    ADJUSTMENT_TYPE["INBOUND"] = "INBOUND";
    ADJUSTMENT_TYPE["MANUAL_ADD"] = "MANUAL_ADD";
    ADJUSTMENT_TYPE["MANUAL_SUBTRACT"] = "MANUAL_SUBTRACT";
})(ADJUSTMENT_TYPE || (exports.ADJUSTMENT_TYPE = ADJUSTMENT_TYPE = {}));
var ADJUSTMENT_STATUS;
(function (ADJUSTMENT_STATUS) {
    ADJUSTMENT_STATUS["REGISTERED"] = "REGISTERED";
    ADJUSTMENT_STATUS["ANNULLED"] = "ANNULLED";
})(ADJUSTMENT_STATUS || (exports.ADJUSTMENT_STATUS = ADJUSTMENT_STATUS = {}));
let StockAdjustmentEntity = class StockAdjustmentEntity extends base_entity_1.BaseEntity {
};
exports.StockAdjustmentEntity = StockAdjustmentEntity;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Generated)('increment'),
    __metadata("design:type", Number)
], StockAdjustmentEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ADJUSTMENT_TYPE,
        default: ADJUSTMENT_TYPE.INBOUND,
    }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "adjustment_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], StockAdjustmentEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "observation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ADJUSTMENT_STATUS,
        default: ADJUSTMENT_STATUS.REGISTERED,
    }),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.UsersEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", users_entity_1.UsersEntity)
], StockAdjustmentEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "company_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fulfillment_product_entity_1.FulfillmentProductEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", fulfillment_product_entity_1.FulfillmentProductEntity)
], StockAdjustmentEntity.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "product_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_variation_entity_1.ProductVariationEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'variation_id' }),
    __metadata("design:type", product_variation_entity_1.ProductVariationEntity)
], StockAdjustmentEntity.prototype, "variation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "variation_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.WarehouseEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'warehouse_id' }),
    __metadata("design:type", warehouse_entity_1.WarehouseEntity)
], StockAdjustmentEntity.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StockAdjustmentEntity.prototype, "warehouse_id", void 0);
exports.StockAdjustmentEntity = StockAdjustmentEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'stock_adjustments' })
], StockAdjustmentEntity);
//# sourceMappingURL=stock-adjustment.entity.js.map