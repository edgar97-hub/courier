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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const path = require("path");
const fs = require("fs");
const error_manager_1 = require("../../utils/error.manager");
const settings_entity_1 = require("../entities/settings.entity");
let SettingsService = class SettingsService {
    constructor(settingsRepository) {
        this.settingsRepository = settingsRepository;
    }
    async createSettings(body) {
        try {
            return await this.settingsRepository.save(body);
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findAllSettings() {
        try {
            return await this.settingsRepository.find();
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findSettingsById(id) {
        try {
            const configurations = await this.settingsRepository.find({ take: 1 });
            if (!configurations || configurations.length === 0) {
                return null;
            }
            return configurations[0];
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findBy({ key, value, }) {
        try {
            const settings = (await this.settingsRepository
                .createQueryBuilder('settings')
                .addSelect('settings.password')
                .where({ [key]: value })
                .getOne());
            return settings;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async getPromotionalSets() {
        const config = await this.settingsRepository.find({ take: 1 });
        if (!config || config.length === 0) {
            return [];
        }
        return (config[0]?.promotional_sets
            ?.filter((set) => set.isActive !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0)) || []);
    }
    async updateSettings(body, id) {
        try {
            if (body.promotional_sets !== undefined) {
                body.promotional_sets = body.promotional_sets.map((set) => ({
                    ...set,
                    id: set.id || Date.now().toString(),
                }));
            }
            const updateResult = await this.settingsRepository.update(id, body);
            if (updateResult.affected === 0) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No se pudo actualizar',
                });
            }
            const updatedSettings = await this.settingsRepository.findOneBy({
                id: id,
            });
            if (!updatedSettings) {
                throw new error_manager_1.ErrorManager({
                    type: 'INTERNAL_SERVER_ERROR',
                    message: 'Los ajustes fueron actualizados pero no se pudieron recuperar.',
                });
            }
            return updatedSettings;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async deleteSettings(id) {
        try {
            const deleteResult = await this.settingsRepository.delete(id);
            if (deleteResult.affected === 0) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No se pudo borrar',
                });
            }
            return deleteResult;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async uploadLogo(logoFile, req) {
        try {
            if (!logoFile) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No logo file provided',
                });
            }
            const fileName = `logo-${Date.now()}-${logoFile.originalname}`;
            const filePath = path.join(__dirname, '..', '..', '..', 'public', 'uploads', fileName);
            await fs.promises.writeFile(filePath, logoFile.buffer);
            const relativeUrl = `/uploads/${fileName}`;
            const protocol = req.protocol;
            const host = req.get('host');
            const absoluteUrl = `${protocol}://${host}${relativeUrl}`;
            return { logo_url: absoluteUrl };
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async uploadTermsPdf(termsPdfFile, req) {
        try {
            if (!termsPdfFile) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No terms PDF file provided',
                });
            }
            const fileName = `terms-${Date.now()}-${termsPdfFile.originalname}`;
            const filePath = path.join(__dirname, '..', '..', '..', 'public', 'uploads', fileName);
            await fs.promises.writeFile(filePath, termsPdfFile.buffer);
            const relativeUrl = `/uploads/${fileName}`;
            const protocol = req.protocol;
            const host = req.get('host');
            const absoluteUrl = `${protocol}://${host}${relativeUrl}`;
            return { terms_conditions_url: absoluteUrl };
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async uploadFile(file, req) {
        try {
            if (!file) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No file provided',
                });
            }
            const fileName = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(__dirname, '..', '..', '..', 'public', 'uploads', fileName);
            await fs.promises.writeFile(filePath, file.buffer);
            const relativeUrl = `/uploads/${fileName}`;
            const protocol = req.protocol;
            const host = req.get('host');
            const absoluteUrl = `${protocol}://${host}${relativeUrl}`;
            return { file_url: absoluteUrl };
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async getBackgroundImage(res) {
        try {
            const setting = await this.settingsRepository.findOne({ where: {} });
            if (!setting?.background_image_url) {
                throw new error_manager_1.ErrorManager({
                    type: 'NOT_FOUND',
                    message: 'Background image URL not found in settings',
                });
            }
            console.log(`Fetching background image from: ${setting.background_image_url}`);
            const imageResponse = await fetch(setting.background_image_url);
            if (imageResponse.ok && imageResponse.body) {
                const contentType = imageResponse.headers.get('content-type');
                res.setHeader('Content-Type', contentType || 'image/png');
                const { pipeline } = await Promise.resolve().then(() => require('stream/promises'));
                await pipeline(imageResponse.body, res);
            }
            else {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_GATEWAY',
                    message: 'Failed to fetch background image',
                });
            }
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async getLogoImage(res) {
        try {
            const setting = await this.settingsRepository.findOne({ where: {} });
            if (!setting?.logo_url) {
                throw new error_manager_1.ErrorManager({
                    type: 'NOT_FOUND',
                    message: 'Logo URL not found in settings',
                });
            }
            console.log(`Fetching logo from: ${setting.logo_url}`);
            const imageResponse = await fetch(setting.logo_url);
            if (imageResponse.ok && imageResponse.body) {
                const contentType = imageResponse.headers.get('content-type');
                res.setHeader('Content-Type', contentType || 'image/png');
                const { pipeline } = await Promise.resolve().then(() => require('stream/promises'));
                await pipeline(imageResponse.body, res);
            }
            else {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_GATEWAY',
                    message: 'Failed to fetch logo',
                });
            }
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async getGlobalNoticeImage(res) {
        try {
            const setting = await this.settingsRepository.findOne({ where: {} });
            if (!setting?.global_notice_image_url) {
                throw new error_manager_1.ErrorManager({
                    type: 'NOT_FOUND',
                    message: 'Global notice image URL not found in settings',
                });
            }
            console.log(`Fetching global notice image from: ${setting.global_notice_image_url}`);
            const imageResponse = await fetch(setting.global_notice_image_url);
            if (imageResponse.ok && imageResponse.body) {
                const contentType = imageResponse.headers.get('content-type');
                res.setHeader('Content-Type', contentType || 'image/png');
                const { pipeline } = await Promise.resolve().then(() => require('stream/promises'));
                await pipeline(imageResponse.body, res);
            }
            else {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_GATEWAY',
                    message: 'Failed to fetch global notice image',
                });
            }
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(settings_entity_1.SettingsEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map