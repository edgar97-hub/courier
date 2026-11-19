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
exports.PlanningImportController = void 0;
const common_1 = require("@nestjs/common");
const planning_import_service_1 = require("../services/planning-import.service");
let PlanningImportController = class PlanningImportController {
    constructor(planningImportService) {
        this.planningImportService = planningImportService;
    }
    async uploadFile(importExcelDto) {
        return await this.planningImportService.importPlanning(importExcelDto);
    }
    async getPlanningEvents(page_number = 1, page_size = 10, sort_field = 'planningDate', sort_direction = 'desc', start_date, end_date, status) {
        try {
            return await this.planningImportService.getPlanningEvents(+page_number, +page_size, sort_field, sort_direction, start_date, end_date, status);
        }
        catch (error) {
            throw new Error(`Failed to fetch planning events: ${error.message}`);
        }
    }
    async getPlanningEventDetails(id) {
        try {
            return await this.planningImportService.getPlanningEventDetails(id);
        }
        catch (error) {
            throw new Error(`Failed to fetch planning event details: ${error.message}`);
        }
    }
};
exports.PlanningImportController = PlanningImportController;
__decorate([
    (0, common_1.Post)('import-batch-json'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], PlanningImportController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(''),
    __param(0, (0, common_1.Query)('page_number')),
    __param(1, (0, common_1.Query)('page_size')),
    __param(2, (0, common_1.Query)('sort_field')),
    __param(3, (0, common_1.Query)('sort_direction')),
    __param(4, (0, common_1.Query)('start_date')),
    __param(5, (0, common_1.Query)('end_date')),
    __param(6, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PlanningImportController.prototype, "getPlanningEvents", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PlanningImportController.prototype, "getPlanningEventDetails", null);
exports.PlanningImportController = PlanningImportController = __decorate([
    (0, common_1.Controller)('planning-events'),
    __metadata("design:paramtypes", [planning_import_service_1.PlanningImportService])
], PlanningImportController);
//# sourceMappingURL=planning-import.controller.js.map