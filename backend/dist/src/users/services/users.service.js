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
const settings_entity_1 = require("../../settings/entities/settings.entity");
let UsersService = class UsersService {
    constructor(userRepository, settingsRepository) {
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
    }
    async createUser(body) {
        try {
            await this.validateVolumeDiscountAssignment(body.isVolumeDiscountEnabled, body.assignedVolumeDiscountRuleIds);
            body.password = await bcrypt.hash(body.password, Number(process.env.HASH_SALT));
            return await this.userRepository.save(body);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async registerCompany(body) {
        try {
            body.password = await bcrypt.hash(body.password, Number(process.env.HASH_SALT));
            body.role = roles_1.ROLES.EMPRESA;
            body.isVolumeDiscountEnabled = false;
            body.assignedVolumeDiscountRuleIds = [];
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
    async findUsersByRol({ search_term = '', role = '', fulfillment_enabled, }) {
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
            if (fulfillment_enabled !== undefined) {
                queryBuilder.andWhere('user.is_fulfillment_enabled = :fulfillment_enabled', {
                    fulfillment_enabled,
                });
            }
            const users = await queryBuilder.getMany();
            return users;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findUsersPaginated(options) {
        try {
            const { page_number, page_size, sort_field, sort_direction, search_term, role, } = options;
            const skip = (page_number - 1) * page_size;
            const queryBuilder = this.userRepository.createQueryBuilder('user');
            if (search_term) {
                queryBuilder.andWhere(new typeorm_2.Brackets((qb) => {
                    qb.where('user.username ILIKE :search', {
                        search: `%${search_term}%`,
                    })
                        .orWhere('user.email ILIKE :search', {
                        search: `%${search_term}%`,
                    })
                        .orWhere('CAST(user.code AS TEXT) ILIKE :search', {
                        search: `%${search_term}%`,
                    })
                        .orWhere('user.business_name ILIKE :search', {
                        search: `%${search_term}%`,
                    })
                        .orWhere('CAST(user.role AS TEXT) ILIKE :search', {
                        search: `%${search_term}%`,
                    });
                }));
            }
            if (role) {
                queryBuilder.andWhere('user.role IN (:...role)', {
                    role: role.split(','),
                });
            }
            const sortFieldMap = {
                code: 'user.code',
                username: 'user.username',
                email: 'user.email',
                role: 'user.role',
                business_name: 'user.business_name',
                createdAt: 'user.createdAt',
            };
            const sortBy = sortFieldMap[sort_field] || `user.${sort_field}`;
            queryBuilder
                .orderBy(sortBy, sort_direction)
                .skip(skip)
                .take(page_size);
            const [items, total_count] = await queryBuilder.getManyAndCount();
            return { items, total_count, page_number, page_size };
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
            const currentUser = await this.userRepository.findOne({
                where: { id },
            });
            await this.validateVolumeDiscountAssignment(body.isVolumeDiscountEnabled, body.assignedVolumeDiscountRuleIds, currentUser);
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
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
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
            const userExists = await this.userRepository.findOne({
                where: { id },
                select: ['id'],
            });
            if (!userExists) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No se pudo borrar',
                });
            }
            const orderCountAsUser = await this.userRepository.query(`SELECT COUNT(*) as count FROM orders WHERE user_id = $1`, [id]);
            const orderCountAsDriver = await this.userRepository.query(`SELECT COUNT(*) as count FROM orders WHERE assigned_driver_id = $1`, [id]);
            const orderCountAsCompany = await this.userRepository.query(`SELECT COUNT(*) as count FROM orders WHERE company_id = $1`, [id]);
            const cashCount = await this.userRepository.query(`SELECT COUNT(*) as count FROM cash_management WHERE user_id = $1`, [id]);
            const distributorCount = await this.userRepository.query(`SELECT COUNT(*) as count FROM distributor_records WHERE user_id = $1`, [id]);
            const relatedRecords = [];
            const asUser = parseInt(orderCountAsUser[0]?.count || '0', 10);
            const asDriver = parseInt(orderCountAsDriver[0]?.count || '0', 10);
            const asCompany = parseInt(orderCountAsCompany[0]?.count || '0', 10);
            const cash = parseInt(cashCount[0]?.count || '0', 10);
            const distributor = parseInt(distributorCount[0]?.count || '0', 10);
            if (asUser > 0)
                relatedRecords.push(`${asUser} orden(es) como cliente`);
            if (asDriver > 0)
                relatedRecords.push(`${asDriver} orden(es) como motorista`);
            if (asCompany > 0)
                relatedRecords.push(`${asCompany} orden(es) como empresa`);
            if (cash > 0)
                relatedRecords.push(`${cash} registro(s) de caja`);
            if (distributor > 0)
                relatedRecords.push(`${distributor} registro(s) de distribuidor`);
            if (relatedRecords.length > 0) {
                throw new common_1.BadRequestException(`No se puede eliminar el usuario porque tiene registros relacionados: ${relatedRecords.join(', ')}.`);
            }
            const result = await this.userRepository.delete(id);
            if (result.affected === 0) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No se pudo borrar',
                });
            }
            return result;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async validateVolumeDiscountAssignment(isEnabled, assignedRuleIds, currentUser) {
        const effectiveEnabled = isEnabled ?? currentUser?.isVolumeDiscountEnabled ?? false;
        const effectiveRuleIds = assignedRuleIds ?? currentUser?.assignedVolumeDiscountRuleIds ?? [];
        if (!effectiveEnabled || effectiveRuleIds.length === 0) {
            return;
        }
        const settings = await this.settingsRepository.findOne({
            where: {},
        });
        const rules = settings?.volumeDiscountRules ?? [];
        const selectedRules = rules.filter((rule) => effectiveRuleIds.includes(rule.id) && rule.isActive !== false);
        const errors = [];
        for (let i = 0; i < selectedRules.length; i++) {
            for (let j = i + 1; j < selectedRules.length; j++) {
                const first = selectedRules[i];
                const second = selectedRules[j];
                if (!this.dateRangesOverlap(first, second)) {
                    continue;
                }
                if (first.type === settings_entity_1.DiscountRuleType.GOAL &&
                    second.type === settings_entity_1.DiscountRuleType.GOAL) {
                    errors.push(`Las metas ${this.volumeRuleLabel(first)} y ${this.volumeRuleLabel(second)} tienen fechas superpuestas.`);
                    continue;
                }
                if (first.type !== second.type) {
                    errors.push(`${this.volumeRuleLabel(first)} y ${this.volumeRuleLabel(second)} coinciden en fechas. Deja solo una.`);
                    continue;
                }
                if (this.orderRangesOverlap(first, second)) {
                    errors.push(`Los rangos ${this.volumeRuleLabel(first)} y ${this.volumeRuleLabel(second)} se superponen en cantidad de pedidos.`);
                }
            }
        }
        if (errors.length > 0) {
            throw new common_1.BadRequestException(errors.join(' '));
        }
    }
    dateRangesOverlap(first, second) {
        const firstStart = (first.startDate || '0000-01-01').slice(0, 10);
        const firstEnd = (first.endDate || '9999-12-31').slice(0, 10);
        const secondStart = (second.startDate || '0000-01-01').slice(0, 10);
        const secondEnd = (second.endDate || '9999-12-31').slice(0, 10);
        return firstStart <= secondEnd && secondStart <= firstEnd;
    }
    orderRangesOverlap(first, second) {
        const firstMax = first.maxOrders ?? Number.MAX_SAFE_INTEGER;
        const secondMax = second.maxOrders ?? Number.MAX_SAFE_INTEGER;
        return first.minOrders <= secondMax && second.minOrders <= firstMax;
    }
    volumeRuleLabel(rule) {
        const base = rule.type === settings_entity_1.DiscountRuleType.GOAL
            ? `meta ${rule.minOrders}`
            : `rango ${rule.minOrders}-${rule.maxOrders ?? '∞'}`;
        const start = (rule.startDate || 'sin inicio').slice(0, 10);
        const end = (rule.endDate || 'sin fin').slice(0, 10);
        return `${base} (${rule.discountPercentage}%) [${start} a ${end}]`;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.UsersEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(settings_entity_1.SettingsEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map