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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcrypt");
const error_manager_1 = require("../../utils/error.manager");
const typeorm_2 = require("typeorm");
const users_entity_1 = require("../entities/users.entity");
const roles_1 = require("../../constants/roles");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async createUser(body) {
        try {
            body.password = await bcrypt.hash(body.password, Number(process.env.HASH_SALT));
            return await this.userRepository.save(body);
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async registerCompany(body) {
        try {
            body.password = await bcrypt.hash(body.password, Number(process.env.HASH_SALT));
            body.role = roles_1.ROLES.EMPRESA;
            const savedUser = await this.userRepository.save(body);
            return savedUser;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findUsers() {
        try {
            const users = await this.userRepository.find({
                order: {
                    code: 'ASC',
                },
            });
            return users;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findUsersByRol({ search_term = '', role = '', }) {
        try {
            const queryBuilder = this.userRepository.createQueryBuilder('user');
            if (search_term) {
                queryBuilder.andWhere('LOWER(user.username) LIKE LOWER(:search)', {
                    search: `%${search_term}%`,
                });
            }
            if (role) {
                queryBuilder.andWhere('user.role IN (:...role)', {
                    role: role.split(','),
                });
            }
            const users = await queryBuilder.getMany();
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
    async findUserPerfil(idUser) {
        console.log('idUser', idUser);
        try {
            const user = await this.userRepository.findOne({
                where: { id: idUser },
            });
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
            if (body.password) {
                body.password = await bcrypt.hash(body.password, Number(process.env.HASH_SALT));
            }
            else {
                delete body.password;
            }
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
    async updateUserCompany(body, id) {
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
    async updateProfile(body, id) {
        try {
            if (body.password) {
                body.password = await bcrypt.hash(body.password, Number(process.env.HASH_SALT));
            }
            else {
                delete body.password;
            }
            await this.userRepository.update(id, body);
            const updatedUser = await this.userRepository.findOne({
                where: { id },
            });
            return updatedUser;
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
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.UsersEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map