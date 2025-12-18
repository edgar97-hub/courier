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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const admin_decorator_1 = require("../../auth/decorators/admin.decorator");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const public_decorator_1 = require("../../auth/decorators/public.decorator");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const roles_1 = require("../../constants/roles");
const setting_dto_1 = require("../dto/setting.dto");
const settings_service_1 = require("../services/settings.service");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async createSettings(body) {
        return await this.settingsService.createSettings(body);
    }
    async findAllSettings() {
        return await this.settingsService.findAllSettings();
    }
    async getPromotionalSets() {
        return this.settingsService.getPromotionalSets();
    }
    async findSettingsById(id) {
        return await this.settingsService.findSettingsById(id);
    }
    async updateSettings(id, body) {
        return await this.settingsService.updateSettings(body, id);
    }
    async deleteSettings(id) {
        return await this.settingsService.deleteSettings(id);
    }
    async uploadLogo(logoFile, request) {
        return await this.settingsService.uploadLogo(logoFile, request);
    }
    async uploadTermsPdf(termsPdfFile, request) {
        return await this.settingsService.uploadTermsPdf(termsPdfFile, request);
    }
    async uploadFile(file, request) {
        return await this.settingsService.uploadFile(file, request);
    }
    async getBackgroundImage(res) {
        return await this.settingsService.getBackgroundImage(res);
    }
    async getLogoImage(res) {
        return await this.settingsService.getLogoImage(res);
    }
    async getGlobalNoticeImage(res) {
        return await this.settingsService.getGlobalNoticeImage(res);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create settings' }),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.RECEPCIONISTA),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [setting_dto_1.SettingDTO]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "createSettings", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all settings' }),
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "findAllSettings", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get promotional sets' }),
    (0, common_1.Get)('promotional-sets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getPromotionalSets", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get settings by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settings UUID' }),
    (0, swagger_1.ApiHeader)({ name: 'codrr_token' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No se encontro resultado' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "findSettingsById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update settings' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settings UUID' }),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.RECEPCIONISTA),
    (0, common_1.Put)('edit/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, setting_dto_1.SettingUpdateDTO]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateSettings", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete settings' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settings UUID' }),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)(roles_1.ROLES.RECEPCIONISTA),
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "deleteSettings", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Upload logo' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.Post)('upload-logo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logoFile')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "uploadLogo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Upload terms PDF' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.Post)('upload-terms-pdf'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('termsPdfFile')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "uploadTermsPdf", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Upload generic file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.Post)('upload-file'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "uploadFile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get background image' }),
    (0, public_decorator_1.PublicAccess)(),
    (0, common_1.Get)('company/background-image'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getBackgroundImage", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get logo image' }),
    (0, public_decorator_1.PublicAccess)(),
    (0, common_1.Get)('company/logo-image'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getLogoImage", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get global notice image' }),
    (0, public_decorator_1.PublicAccess)(),
    (0, common_1.Get)('company/global-notice-image'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getGlobalNoticeImage", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('Settings'),
    (0, common_1.Controller)('settings'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map