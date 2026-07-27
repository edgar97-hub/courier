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
exports.InventoryEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
const warehouse_entity_1 = require("./warehouse.entity");
const product_variation_entity_1 = require("./product-variation.entity");
let InventoryEntity = class InventoryEntity extends base_entity_1.BaseEntity {
};
exports.InventoryEntity = InventoryEntity;
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventoryEntity.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.WarehouseEntity, (warehouse) => warehouse.inventory, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'warehouse_id' }),
    __metadata("design:type", warehouse_entity_1.WarehouseEntity)
], InventoryEntity.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InventoryEntity.prototype, "warehouse_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_variation_entity_1.ProductVariationEntity, (variation) => variation.inventory, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'variation_id' }),
    __metadata("design:type", product_variation_entity_1.ProductVariationEntity)
], InventoryEntity.prototype, "variation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InventoryEntity.prototype, "variation_id", void 0);
exports.InventoryEntity = InventoryEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'inventory' }),
    (0, typeorm_1.Unique)(['warehouse_id', 'variation_id'])
], InventoryEntity);
//# sourceMappingURL=inventory.entity.js.map