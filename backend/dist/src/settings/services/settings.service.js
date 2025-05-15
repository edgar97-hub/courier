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
const error_manager_1 = require("../../utils/error.manager");
const typeorm_2 = require("typeorm");
const settings_entity_1 = require("../entities/settings.entity");
let SettingsService = class SettingsService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async createUser(body) {
        try {
            return await this.userRepository.save(body);
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findUsers() {
        try {
            const users = await this.userRepository.find();
            return users;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findUserById(id) {
        try {
            const user = (await this.userRepository
                .createQueryBuilder('user')
                .where({ id })
                .leftJoinAndSelect('user.projectsIncludes', 'projectsIncludes')
                .leftJoinAndSelect('projectsIncludes.project', 'project')
                .getOne());
            if (!user) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No se encontro resultado',
                });
            }
            return user;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findBy({ key, value }) {
        try {
            const user = (await this.userRepository
                .createQueryBuilder('user')
                .addSelect('user.password')
                .where({ [key]: value })
                .getOne());
            return user;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async updateUser(body, id) {
        try {
            const user = await this.userRepository.update(id, body);
            if (user.affected === 0) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No se pudo actualizar',
                });
            }
            return user;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async deleteUser(id) {
        try {
            const user = await this.userRepository.delete(id);
            if (user.affected === 0) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No se pudo borrar',
                });
            }
            return user;
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