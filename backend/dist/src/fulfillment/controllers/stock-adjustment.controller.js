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
exports.StockAdjustmentController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const stock_adjustment_service_1 = require("../services/stock-adjustment.service");
const create_stock_adjustment_dto_1 = require("../dto/create-stock-adjustment.dto");
let StockAdjustmentController = class StockAdjustmentController {
    constructor(stockAdjustmentService) {
        this.stockAdjustmentService = stockAdjustmentService;
    }
    async create(dto, req) {
        return this.stockAdjustmentService.create(dto, req.idUser);
    }
    async findPaginated(page_number = 1, page_size = 20, sort_field = 'createdAt', sort_direction = 'DESC', search_term = '') {
        return this.stockAdjustmentService.findPaginated({
            page_number,
            page_size,
            sort_field,
            sort_direction,
            search_term,
        });
    }
    async getProductsByCompany(companyId) {
        return this.stockAdjustmentService.getProductsByCompany(companyId);
    }
    async getVariationsByProduct(productId) {
        return this.stockAdjustmentService.getVariationsByProduct(productId);
    }
    async getMainWarehouse() {
        return this.stockAdjustmentService.getMainWarehouse();
    }
    async annul(id, req) {
        return this.stockAdjustmentService.annul(id, req.idUser);
    }
};
exports.StockAdjustmentController = StockAdjustmentController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_adjustment_dto_1.CreateStockAdjustmentDto, Object]),
    __metadata("design:returntype", Promise)
], StockAdjustmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('paginated'),
    __param(0, (0, common_1.Query)('page_number', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('sort_field')),
    __param(3, (0, common_1.Query)('sort_direction')),
    __param(4, (0, common_1.Query)('search_term')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], StockAdjustmentController.prototype, "findPaginated", null);
__decorate([
    (0, common_1.Get)('products/by-company/:companyId'),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockAdjustmentController.prototype, "getProductsByCompany", null);
__decorate([
    (0, common_1.Get)('variations/by-product/:productId'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockAdjustmentController.prototype, "getVariationsByProduct", null);
__decorate([
    (0, common_1.Get)('main-warehouse'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockAdjustmentController.prototype, "getMainWarehouse", null);
__decorate([
    (0, common_1.Put)(':id/annul'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StockAdjustmentController.prototype, "annul", null);
exports.StockAdjustmentController = StockAdjustmentController = __decorate([
    (0, common_1.Controller)('fulfillment/stock-adjustments'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [stock_adjustment_service_1.StockAdjustmentService])
], StockAdjustmentController);
//# sourceMappingURL=stock-adjustment.controller.js.map