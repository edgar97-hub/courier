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
exports.KardexEntity = exports.KARDEX_MOVEMENT_TYPE = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
const users_entity_1 = require("../../users/entities/users.entity");
const fulfillment_product_entity_1 = require("./fulfillment-product.entity");
const product_variation_entity_1 = require("./product-variation.entity");
const warehouse_entity_1 = require("./warehouse.entity");
var KARDEX_MOVEMENT_TYPE;
(function (KARDEX_MOVEMENT_TYPE) {
    KARDEX_MOVEMENT_TYPE["INBOUND"] = "INBOUND";
    KARDEX_MOVEMENT_TYPE["ORDER_OUT"] = "ORDER_OUT";
    KARDEX_MOVEMENT_TYPE["MANUAL_ADD"] = "MANUAL_ADD";
    KARDEX_MOVEMENT_TYPE["MANUAL_SUBTRACT"] = "MANUAL_SUBTRACT";
    KARDEX_MOVEMENT_TYPE["ANNUL_REVERSAL"] = "ANNUL_REVERSAL";
})(KARDEX_MOVEMENT_TYPE || (exports.KARDEX_MOVEMENT_TYPE = KARDEX_MOVEMENT_TYPE = {}));
let KardexEntity = class KardexEntity extends base_entity_1.BaseEntity {
};
exports.KardexEntity = KardexEntity;
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: KARDEX_MOVEMENT_TYPE,
    }),
    __metadata("design:type", String)
], KardexEntity.prototype, "movement_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], KardexEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], KardexEntity.prototype, "stock_before", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], KardexEntity.prototype, "stock_after", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], KardexEntity.prototype, "observation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.UsersEntity, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'responsible_user_id' }),
    __metadata("design:type", users_entity_1.UsersEntity)
], KardexEntity.prototype, "responsibleUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KardexEntity.prototype, "responsible_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], KardexEntity.prototype, "reference_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], KardexEntity.prototype, "reference_type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.UsersEntity, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", users_entity_1.UsersEntity)
], KardexEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KardexEntity.prototype, "company_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fulfillment_product_entity_1.FulfillmentProductEntity, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", fulfillment_product_entity_1.FulfillmentProductEntity)
], KardexEntity.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KardexEntity.prototype, "product_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_variation_entity_1.ProductVariationEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'variation_id' }),
    __metadata("design:type", product_variation_entity_1.ProductVariationEntity)
], KardexEntity.prototype, "variation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KardexEntity.prototype, "variation_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.WarehouseEntity, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'warehouse_id' }),
    __metadata("design:type", warehouse_entity_1.WarehouseEntity)
], KardexEntity.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KardexEntity.prototype, "warehouse_id", void 0);
exports.KardexEntity = KardexEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'kardex' })
], KardexEntity);
//# sourceMappingURL=kardex.entity.js.map