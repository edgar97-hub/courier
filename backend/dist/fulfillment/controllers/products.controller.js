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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const products_service_1 = require("../services/products.service");
const create_fulfillment_product_dto_1 = require("../dto/create-fulfillment-product.dto");
let ProductsController = class ProductsController {
    constructor(fulfillmentService) {
        this.fulfillmentService = fulfillmentService;
    }
    async create(dto) {
        return this.fulfillmentService.create(dto);
    }
    async findProductNames() {
        return this.fulfillmentService.findDistinctProductNames();
    }
    async findVariationValues() {
        return this.fulfillmentService.findDistinctVariationValues();
    }
    async findAll() {
        return this.fulfillmentService.findAll();
    }
    async findProductsPaginated(page_number = 1, page_size = 20, sort_field = 'createdAt', sort_direction = 'DESC', search_term = '') {
        return this.fulfillmentService.findProductsPaginated({
            page_number,
            page_size,
            sort_field,
            sort_direction,
            search_term,
        });
    }
    async findOne(id) {
        return this.fulfillmentService.findOne(id);
    }
    async update(id, dto) {
        return this.fulfillmentService.update(id, dto);
    }
    async remove(id) {
        return this.fulfillmentService.remove(id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fulfillment_product_dto_1.CreateFulfillmentProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('products/names'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findProductNames", null);
__decorate([
    (0, common_1.Get)('variations/values'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findVariationValues", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('products/paginated'),
    __param(0, (0, common_1.Query)('page_number', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('sort_field')),
    __param(3, (0, common_1.Query)('sort_direction')),
    __param(4, (0, common_1.Query)('search_term')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findProductsPaginated", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('fulfillment'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [products_service_1.FulfillmentService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map