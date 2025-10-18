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
exports.DistributorRecordsController = void 0;
const common_1 = require("@nestjs/common");
const distributor_records_service_1 = require("../services/distributor-records.service");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const roles_1 = require("../../constants/roles");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const distributor_record_dto_1 = require("../dto/distributor-record.dto");
const public_decorator_1 = require("../../auth/decorators/public.decorator");
const pdf_generator_service_1 = require("../services/pdf-generator.service");
const rxjs_1 = require("rxjs");
let DistributorRecordsController = class DistributorRecordsController {
    constructor(distributorRecordsService, pdfGeneratorService) {
        this.distributorRecordsService = distributorRecordsService;
        this.pdfGeneratorService = pdfGeneratorService;
    }
    async getRegistrations(req, page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'DESC', search = '') {
        return this.distributorRecordsService.findAllPaginated(req, {
            page,
            limit,
            sortField,
            sortOrder,
            search,
        });
    }
    async createDistributorRecord(body, req) {
        return await this.distributorRecordsService.createDistributorRecord(body, req.idUser);
    }
    async updateDistributorRecord(id, body, req) {
        return await this.distributorRecordsService.updateDistributorRecord(id, body, req.idUser);
    }
    async deleteDistributorRecord(id) {
        return await this.distributorRecordsService.deleteDistributorRecord(id);
    }
    async importBatchJson(dtos, req) {
        return this.distributorRecordsService.importFromParsedJson(dtos, req.idUser);
    }
    async getOrderPdfA4(orderId, req, res) {
        try {
            await this.pdfGeneratorService.streamDistributorRecordPdfToResponse(orderId, res);
        }
        catch (error) {
            console.error('Error in PDF streaming controller:', error);
            if (!res.headersSent) {
                if (error instanceof rxjs_1.NotFoundError) {
                    res.status(404).send({ message: error.message });
                }
                else {
                    res.status(500).send({ message: 'Error generating PDF stream' });
                }
            }
        }
    }
};
exports.DistributorRecordsController = DistributorRecordsController;
__decorate([
    (0, common_1.Get)(''),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('sortField')),
    __param(4, (0, common_1.Query)('sortOrder')),
    __param(5, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], DistributorRecordsController.prototype, "getRegistrations", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.EMPRESA_DISTRIBUIDOR, roles_1.ROLES.ADMINISTRADOR, roles_1.ROLES.RECEPCIONISTA),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [distributor_record_dto_1.DistributorRecordDTO, Object]),
    __metadata("design:returntype", Promise)
], DistributorRecordsController.prototype, "createDistributorRecord", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.ADMINISTRADOR, roles_1.ROLES.RECEPCIONISTA),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, distributor_record_dto_1.UpdateDistributorRecordDTO, Object]),
    __metadata("design:returntype", Promise)
], DistributorRecordsController.prototype, "updateDistributorRecord", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.ADMINISTRADOR, roles_1.ROLES.RECEPCIONISTA),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DistributorRecordsController.prototype, "deleteDistributorRecord", null);
__decorate([
    (0, common_1.Post)('import-batch-json'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.ADMINISTRADOR, roles_1.ROLES.RECEPCIONISTA, roles_1.ROLES.EMPRESA_DISTRIBUIDOR),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], DistributorRecordsController.prototype, "importBatchJson", null);
__decorate([
    (0, public_decorator_1.PublicAccess)(),
    (0, common_1.Get)(':id/pdf-rotulado'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DistributorRecordsController.prototype, "getOrderPdfA4", null);
exports.DistributorRecordsController = DistributorRecordsController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('distributor-records'),
    __metadata("design:paramtypes", [distributor_records_service_1.DistributorRecordsService,
        pdf_generator_service_1.PdfGeneratorService])
], DistributorRecordsController);
//# sourceMappingURL=distributor-records.controller.js.map