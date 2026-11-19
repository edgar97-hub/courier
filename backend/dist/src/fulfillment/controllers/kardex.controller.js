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
exports.KardexController = void 0;
const common_1 = require("@nestjs/common");
const kardex_service_1 = require("../services/kardex.service");
let KardexController = class KardexController {
    constructor(kardexService) {
        this.kardexService = kardexService;
    }
    async findPaginated(page_number = '1', page_size = '20', sort_field = 'createdAt', sort_direction = 'DESC', search_term = '', filter_company, filter_company_id, filter_product, filter_sku, filter_movement_type, filter_date_from, filter_date_to, filter_responsible_user, filter_observation, filter_quantity_from, filter_quantity_to, filter_stock_after_from, filter_stock_after_to) {
        return this.kardexService.findPaginated({
            page_number: parseInt(page_number, 10) || 1,
            page_size: parseInt(page_size, 10) || 20,
            sort_field,
            sort_direction,
            search_term,
            filter_company,
            filter_company_id,
            filter_product,
            filter_sku,
            filter_movement_type,
            filter_date_from,
            filter_date_to,
            filter_responsible_user,
            filter_observation,
            filter_quantity_from: filter_quantity_from
                ? parseInt(filter_quantity_from, 10)
                : undefined,
            filter_quantity_to: filter_quantity_to
                ? parseInt(filter_quantity_to, 10)
                : undefined,
            filter_stock_after_from: filter_stock_after_from
                ? parseInt(filter_stock_after_from, 10)
                : undefined,
            filter_stock_after_to: filter_stock_after_to
                ? parseInt(filter_stock_after_to, 10)
                : undefined,
        });
    }
};
exports.KardexController = KardexController;
__decorate([
    (0, common_1.Get)('query'),
    __param(0, (0, common_1.Query)('page_number')),
    __param(1, (0, common_1.Query)('page_size')),
    __param(2, (0, common_1.Query)('sort_field')),
    __param(3, (0, common_1.Query)('sort_direction')),
    __param(4, (0, common_1.Query)('search_term')),
    __param(5, (0, common_1.Query)('filter_company')),
    __param(6, (0, common_1.Query)('filter_company_id')),
    __param(7, (0, common_1.Query)('filter_product')),
    __param(8, (0, common_1.Query)('filter_sku')),
    __param(9, (0, common_1.Query)('filter_movement_type')),
    __param(10, (0, common_1.Query)('filter_date_from')),
    __param(11, (0, common_1.Query)('filter_date_to')),
    __param(12, (0, common_1.Query)('filter_responsible_user')),
    __param(13, (0, common_1.Query)('filter_observation')),
    __param(14, (0, common_1.Query)('filter_quantity_from')),
    __param(15, (0, common_1.Query)('filter_quantity_to')),
    __param(16, (0, common_1.Query)('filter_stock_after_from')),
    __param(17, (0, common_1.Query)('filter_stock_after_to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KardexController.prototype, "findPaginated", null);
exports.KardexController = KardexController = __decorate([
    (0, common_1.Controller)('fulfillment/kardex'),
    __metadata("design:paramtypes", [kardex_service_1.KardexService])
], KardexController);
//# sourceMappingURL=kardex.controller.js.map