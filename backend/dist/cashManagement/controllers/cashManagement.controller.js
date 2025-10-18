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
exports.CashManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cashManagement_service_1 = require("../services/cashManagement.service");
const cashManagement_dto_1 = require("../dto/cashManagement.dto");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const roles_1 = require("../../constants/roles");
const cash_movement_pdf_generator_service_1 = require("../services/cash-movement-pdf-generator.service");
const admin_decorator_1 = require("../../auth/decorators/admin.decorator");
const public_decorator_1 = require("../../auth/decorators/public.decorator");
let CashManagementController = class CashManagementController {
    constructor(cashManagementService, cashMovementPdfGeneratorService) {
        this.cashManagementService = cashManagementService;
        this.cashMovementPdfGeneratorService = cashMovementPdfGeneratorService;
    }
    async createManualMovement(createCashMovementDto, req) {
        if (!req.idUser) {
            throw new common_1.BadRequestException('User ID not found in request');
        }
        const userId = req.idUser;
        return this.cashManagementService.createManualMovement(createCashMovementDto, userId);
    }
    async updateCashMovement(id, updateCashMovementDto, req) {
        if (!req.idUser) {
            throw new common_1.BadRequestException('User ID not found in request');
        }
        const userId = req.idUser;
        return this.cashManagementService.updateCashMovement(id, updateCashMovementDto, userId);
    }
    async deleteCashMovement(id) {
        return this.cashManagementService.deleteCashMovement(id);
    }
    async findAllMovements(query, pageNumber = 1, pageSize = 10) {
        return this.cashManagementService.findAllMovements(query, pageNumber, pageSize);
    }
    async getBalanceSummary(query) {
        return this.cashManagementService.getBalanceSummary(query);
    }
    async getDetailedBalanceSummary(query) {
        return this.cashManagementService.getDetailedBalanceSummary(query);
    }
    async getCashMovementPdf(id, req, res) {
        await this.cashMovementPdfGeneratorService.streamCashMovementPdfA4ToResponse(id, req, res);
    }
    async getCashMovementPdfTicket(id, req, res) {
        await this.cashMovementPdfGeneratorService.streamCashMovementPdf80mmToResponse(id, req, res);
    }
};
exports.CashManagementController = CashManagementController;
__decorate([
    (0, common_1.Post)('manual-movement'),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.RECEPCIONISTA),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Movimiento de caja manual registrado exitosamente.',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acceso denegado.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cashManagement_dto_1.CreateCashMovementDto, Object]),
    __metadata("design:returntype", Promise)
], CashManagementController.prototype, "createManualMovement", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.RECEPCIONISTA),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del movimiento de caja' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Movimiento de caja actualizado exitosamente.',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acceso denegado.' }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Movimiento de caja no encontrado.',
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cashManagement_dto_1.CreateCashMovementDto, Object]),
    __metadata("design:returntype", Promise)
], CashManagementController.prototype, "updateCashMovement", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.RECEPCIONISTA),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del movimiento de caja' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Movimiento de caja eliminado exitosamente.',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acceso denegado.' }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Movimiento de caja no encontrado.',
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CashManagementController.prototype, "deleteCashMovement", null);
__decorate([
    (0, common_1.Get)('movements'),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.RECEPCIONISTA),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listado de movimientos de caja.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acceso denegado.' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('page_number')),
    __param(2, (0, common_1.Query)('page_size')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cashManagement_dto_1.QueryCashMovementDto, Number, Number]),
    __metadata("design:returntype", Promise)
], CashManagementController.prototype, "findAllMovements", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.RECEPCIONISTA),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resumen de saldos de caja.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acceso denegado.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cashManagement_dto_1.QueryCashMovementDto]),
    __metadata("design:returntype", Promise)
], CashManagementController.prototype, "getBalanceSummary", null);
__decorate([
    (0, common_1.Get)('detailed-summary'),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.RECEPCIONISTA),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Resumen detallado de saldos de caja.',
        type: cashManagement_dto_1.DetailedCashMovementSummaryDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acceso denegado.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cashManagement_dto_1.QueryCashMovementDto]),
    __metadata("design:returntype", Promise)
], CashManagementController.prototype, "getDetailedBalanceSummary", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.RECEPCIONISTA),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del movimiento de caja' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'PDF del movimiento de caja generado exitosamente.',
        type: 'application/pdf',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Movimiento de caja no encontrado.',
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CashManagementController.prototype, "getCashMovementPdf", null);
__decorate([
    (0, common_1.Get)(':id/pdf/ticket'),
    (0, public_decorator_1.PublicAccess)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del movimiento de caja' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'PDF del movimiento de caja en formato ticket generado exitosamente.',
        type: 'application/pdf',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Movimiento de caja no encontrado.',
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CashManagementController.prototype, "getCashMovementPdfTicket", null);
exports.CashManagementController = CashManagementController = __decorate([
    (0, swagger_1.ApiTags)('Cash Management'),
    (0, common_1.Controller)('cash-management'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [cashManagement_service_1.CashManagementService,
        cash_movement_pdf_generator_service_1.CashMovementPdfGeneratorService])
], CashManagementController);
//# sourceMappingURL=cashManagement.controller.js.map