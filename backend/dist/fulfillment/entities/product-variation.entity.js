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
exports.ProductVariationEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
const fulfillment_product_entity_1 = require("./fulfillment-product.entity");
const inventory_entity_1 = require("./inventory.entity");
let ProductVariationEntity = class ProductVariationEntity extends base_entity_1.BaseEntity {
};
exports.ProductVariationEntity = ProductVariationEntity;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Generated)('increment'),
    __metadata("design:type", Number)
], ProductVariationEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], ProductVariationEntity.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ProductVariationEntity.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ProductVariationEntity.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], ProductVariationEntity.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], ProductVariationEntity.prototype, "length_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], ProductVariationEntity.prototype, "width_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], ProductVariationEntity.prototype, "height_cm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], ProductVariationEntity.prototype, "weight_kg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 5 }),
    __metadata("design:type", Number)
], ProductVariationEntity.prototype, "min_stock", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => inventory_entity_1.InventoryEntity, (inventory) => inventory.variation),
    __metadata("design:type", Array)
], ProductVariationEntity.prototype, "inventory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fulfillment_product_entity_1.FulfillmentProductEntity, (product) => product.variations, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", fulfillment_product_entity_1.FulfillmentProductEntity)
], ProductVariationEntity.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProductVariationEntity.prototype, "product_id", void 0);
exports.ProductVariationEntity = ProductVariationEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'product_variations' })
], ProductVariationEntity);
//# sourceMappingURL=product-variation.entity.js.map