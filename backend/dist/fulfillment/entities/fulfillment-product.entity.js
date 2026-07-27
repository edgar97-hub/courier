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
exports.FulfillmentProductEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
const users_entity_1 = require("../../users/entities/users.entity");
const product_variation_entity_1 = require("./product-variation.entity");
let FulfillmentProductEntity = class FulfillmentProductEntity extends base_entity_1.BaseEntity {
};
exports.FulfillmentProductEntity = FulfillmentProductEntity;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Generated)('increment'),
    __metadata("design:type", Number)
], FulfillmentProductEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], FulfillmentProductEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], FulfillmentProductEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.UsersEntity),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", users_entity_1.UsersEntity)
], FulfillmentProductEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FulfillmentProductEntity.prototype, "company_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_variation_entity_1.ProductVariationEntity, (variation) => variation.product, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], FulfillmentProductEntity.prototype, "variations", void 0);
exports.FulfillmentProductEntity = FulfillmentProductEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'fulfillment_products' })
], FulfillmentProductEntity);
//# sourceMappingURL=fulfillment-product.entity.js.map