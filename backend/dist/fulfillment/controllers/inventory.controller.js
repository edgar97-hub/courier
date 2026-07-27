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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const inventory_service_1 = require("../services/inventory.service");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async queryInventory(page_number = 1, page_size = 20, sort_field = 'createdAt', sort_direction = 'DESC', search_term = '', low_stock_only, filter_company, filter_company_id, filter_product, filter_product_id, filter_variation_id, filter_sku, filter_color, filter_size, filter_model, filter_stock_from_str, filter_stock_to_str, filter_min_stock_from_str, filter_min_stock_to_str) {
        const filter_stock_from = filter_stock_from_str !== undefined ? Number(filter_stock_from_str) : undefined;
        const filter_stock_to = filter_stock_to_str !== undefined ? Number(filter_stock_to_str) : undefined;
        const filter_min_stock_from = filter_min_stock_from_str !== undefined ? Number(filter_min_stock_from_str) : undefined;
        const filter_min_stock_to = filter_min_stock_to_str !== undefined ? Number(filter_min_stock_to_str) : undefined;
        return this.inventoryService.queryInventory({
            page_number,
            page_size,
            sort_field,
            sort_direction,
            search_term,
            filter_company,
            filter_company_id,
            filter_product,
            filter_product_id,
            filter_variation_id,
            filter_sku,
            filter_color,
            filter_size,
            filter_model,
            filter_stock_from,
            filter_stock_to,
            filter_min_stock_from,
            filter_min_stock_to,
        });
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('query'),
    __param(0, (0, common_1.Query)('page_number', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page_size', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('sort_field')),
    __param(3, (0, common_1.Query)('sort_direction')),
    __param(4, (0, common_1.Query)('search_term')),
    __param(5, (0, common_1.Query)('low_stock_only')),
    __param(6, (0, common_1.Query)('filter_company')),
    __param(7, (0, common_1.Query)('filter_company_id')),
    __param(8, (0, common_1.Query)('filter_product')),
    __param(9, (0, common_1.Query)('filter_product_id')),
    __param(10, (0, common_1.Query)('filter_variation_id')),
    __param(11, (0, common_1.Query)('filter_sku')),
    __param(12, (0, common_1.Query)('filter_color')),
    __param(13, (0, common_1.Query)('filter_size')),
    __param(14, (0, common_1.Query)('filter_model')),
    __param(15, (0, common_1.Query)('filter_stock_from')),
    __param(16, (0, common_1.Query)('filter_stock_to')),
    __param(17, (0, common_1.Query)('filter_min_stock_from')),
    __param(18, (0, common_1.Query)('filter_min_stock_to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "queryInventory", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('fulfillment/inventory'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map