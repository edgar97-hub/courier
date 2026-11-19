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
exports.DistributorRecordsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const distributor_record_entity_1 = require("../entities/distributor-record.entity");
const users_entity_1 = require("../../users/entities/users.entity");
const users_service_1 = require("../../users/services/users.service");
const error_manager_1 = require("../../utils/error.manager");
const roles_1 = require("../../constants/roles");
let DistributorRecordsService = class DistributorRecordsService {
    constructor(distributorRecordRepository, userRepository, usersService, dataSource) {
        this.distributorRecordRepository = distributorRecordRepository;
        this.userRepository = userRepository;
        this.usersService = usersService;
        this.dataSource = dataSource;
    }
    async findAllPaginated(req, options) {
        const idUser = req.idUser;
        const role = req.roleUser;
        const { page, limit, sortField, sortOrder, search, startDate, endDate } = options;
        const skip = (page - 1) * limit;
        const queryBuilder = this.distributorRecordRepository.createQueryBuilder('record');
        queryBuilder.leftJoinAndSelect('record.user', 'user');
        if (role === roles_1.ROLES.EMPRESA_DISTRIBUIDOR) {
            queryBuilder.andWhere('record.user_id = :idUser', { idUser });
        }
        if (search) {
            queryBuilder.andWhere(new typeorm_2.Brackets((qb) => {
                qb.where('record.clientName ILIKE :search', { search: `%${search}%` })
                    .orWhere('record.clientDni ILIKE :search', {
                    search: `%${search}%`,
                })
                    .orWhere('record.destinationAddress ILIKE :search', {
                    search: `%${search}%`,
                })
                    .orWhere('record.observation ILIKE :search', {
                    search: `%${search}%`,
                })
                    .orWhere('record.clientPhone ILIKE :search', {
                    search: `%${search}%`,
                })
                    .orWhere('user.username ILIKE :search', { search: `%${search}%` });
            }));
        }
        if (startDate && endDate) {
            queryBuilder.andWhere('record.updatedAt BETWEEN :start AND :end', {
                start: startDate,
                end: endDate,
            });
        }
        queryBuilder
            .orderBy(`record.${sortField}`, sortOrder)
            .skip(skip)
            .take(limit);
        const [data, total] = await queryBuilder.getManyAndCount();
        const sanitizedData = data.map((record) => {
            if (record.user) {
                return {
                    ...record,
                    user: {
                        id: record.user.id,
                        username: record.user.username,
                    },
                };
            }
            return record;
        });
        return { data: sanitizedData, total, page, limit };
    }
    async createDistributorRecord(body, userId) {
        try {
            const user = await this.usersService.findUserById(userId);
            if (!user) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'User not found',
                });
            }
            const newRecord = this.distributorRecordRepository.create({
                ...body,
                user: user,
            });
            return await this.distributorRecordRepository.save(newRecord);
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findDistributorRecordById(id) {
        try {
            const record = await this.distributorRecordRepository.findOne({
                where: { id },
            });
            if (!record) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'Record not found',
                });
            }
            return record;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async updateDistributorRecord(id, body, userId) {
        try {
            const user = await this.usersService.findUserById(userId);
            if (!user) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'User not found',
                });
            }
            const record = await this.findDistributorRecordById(id);
            this.distributorRecordRepository.merge(record, {
                ...body,
            });
            return await this.distributorRecordRepository.save(record);
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async deleteDistributorRecord(id) {
        try {
            const record = await this.findDistributorRecordById(id);
            await this.distributorRecordRepository.delete(record.id);
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async importFromParsedJson(dtos, userId) {
        const user = await this.usersService.findUserById(userId);
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        if (!dtos || dtos.length === 0) {
            return {
                success: false,
                message: 'No se proporcionaron datos para importar.',
            };
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const registrationsToSave = dtos.map((dto) => this.distributorRecordRepository.create({
                ...dto,
                user: user,
            }));
            await queryRunner.manager.save(registrationsToSave);
            await queryRunner.commitTransaction();
            return {
                success: true,
                message: `¡Importación exitosa! Se han creado ${registrationsToSave.length} nuevos registros.`,
                importedCount: registrationsToSave.length,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error durante la transacción de importación, se ha hecho rollback:', error);
            return {
                success: false,
                message: `Error al guardar en la base de datos. Ningún registro fue importado.`,
                errors: [{ row: 0, message: `Detalle del error: ${error.message}` }],
            };
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.DistributorRecordsService = DistributorRecordsService;
exports.DistributorRecordsService = DistributorRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(distributor_record_entity_1.DistributorRecordEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(users_entity_1.UsersEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        typeorm_2.DataSource])
], DistributorRecordsService);
//# sourceMappingURL=distributor-records.service.js.map