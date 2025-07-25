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
exports.CashManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cashManagement_entity_1 = require("../entities/cashManagement.entity");
const users_service_1 = require("../../users/services/users.service");
const date_fns_tz_1 = require("date-fns-tz");
let CashManagementService = class CashManagementService {
    constructor(cashMovementRepository, usersService) {
        this.cashMovementRepository = cashMovementRepository;
        this.usersService = usersService;
    }
    async createManualMovement(dto, userId) {
        const user = await this.usersService.findUserById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const newMovement = this.cashMovementRepository.create({
            ...dto,
            date: dto.date
                ? (0, date_fns_tz_1.formatInTimeZone)(new Date(dto.date), 'America/Lima', 'yyyy-MM-dd')
                : undefined,
            paymentsMethod: dto.paymentsMethod,
            user: user,
        });
        return await this.cashMovementRepository.save(newMovement);
    }
    async updateCashMovement(id, dto, userId) {
        const existingMovement = await this.cashMovementRepository.findOne({
            where: { id },
        });
        if (!existingMovement) {
            throw new common_1.NotFoundException(`Cash movement with ID ${id} not found`);
        }
        const user = await this.usersService.findUserById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const updatedMovement = this.cashMovementRepository.merge(existingMovement, {
            ...dto,
            date: dto.date
                ? (0, date_fns_tz_1.formatInTimeZone)(new Date(dto.date), 'America/Lima', 'yyyy-MM-dd')
                : undefined,
            paymentsMethod: dto.paymentsMethod,
            user: user,
        });
        return await this.cashMovementRepository.save(updatedMovement);
    }
    async deleteCashMovement(id) {
        const result = await this.cashMovementRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Cash movement with ID ${id} not found`);
        }
    }
    async createAutomaticIncome(amount, paymentMethod, userId, orderId, code) {
        const user = await this.usersService.findUserById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const newMovement = this.cashMovementRepository.create({
            date: (0, date_fns_tz_1.formatInTimeZone)(new Date(), 'America/Lima', 'yyyy-MM-dd'),
            amount,
            typeMovement: cashManagement_entity_1.TYPES_MOVEMENTS.INCOME,
            paymentsMethod: paymentMethod,
            description: 'Ingreso automático por pedido # ' + code,
            user: user,
            order: { id: orderId },
        });
        return await this.cashMovementRepository.save(newMovement);
    }
    async reverseAutomaticIncome(orderId) {
        const movement = await this.cashMovementRepository.findOne({
            where: {
                order: { id: orderId },
            },
        });
        if (movement) {
            await this.cashMovementRepository.remove(movement);
        }
    }
    async findAllMovements(query, pageNumber = 1, pageSize = 10) {
        const where = {};
        if (query.startDate && query.endDate) {
            where.date = (0, typeorm_2.Between)(query.startDate, query.endDate);
        }
        if (query.typeMovement) {
            where.typeMovement = query.typeMovement;
        }
        if (query.paymentsMethod) {
            where.paymentsMethod = query.paymentsMethod;
        }
        if (query.userId) {
            where.user = { id: query.userId };
        }
        const [movements, total] = await this.cashMovementRepository.findAndCount({
            where,
            order: { date: 'DESC' },
            relations: ['user'],
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
        });
        return { movements, total };
    }
    async getBalanceSummary(query) {
        const movements = await this.cashMovementRepository.find({
            where: this.buildWhereClauseForSummary(query),
            relations: ['user'],
        });
        let totalIncome = 0;
        let totalExpense = 0;
        for (const movement of movements) {
            if (movement.typeMovement === cashManagement_entity_1.TYPES_MOVEMENTS.INCOME) {
                totalIncome += movement.amount;
            }
            else if (movement.typeMovement === cashManagement_entity_1.TYPES_MOVEMENTS.OUTCOME) {
                totalExpense += movement.amount;
            }
        }
        const balance = totalIncome - totalExpense;
        return { totalIncome, totalExpense, balance };
    }
    async getDetailedBalanceSummary(query) {
        const movements = await this.cashMovementRepository.find({
            where: this.buildWhereClauseForSummary(query),
            relations: ['user'],
        });
        const paymentMethods = [
            'Efectivo',
            'Yape/Transferencia BCP',
            'Plin/Transferencia INTERBANK',
            'POS',
        ];
        const summary = {
            Efectivo: { income: 0, expense: 0, balance: 0 },
            'Yape/Transferencia BCP': { income: 0, expense: 0, balance: 0 },
            'Plin/Transferencia INTERBANK': { income: 0, expense: 0, balance: 0 },
            POS: { income: 0, expense: 0, balance: 0 },
            totalCashIncome: 0,
            totalCashExpense: 0,
            totalCashBalance: 0,
        };
        for (const movement of movements) {
            const method = movement.paymentsMethod;
            if (paymentMethods.includes(method)) {
                if (movement.typeMovement === cashManagement_entity_1.TYPES_MOVEMENTS.INCOME) {
                    summary[method].income += movement.amount;
                    summary.totalCashIncome += movement.amount;
                }
                else if (movement.typeMovement === cashManagement_entity_1.TYPES_MOVEMENTS.OUTCOME) {
                    summary[method].expense += movement.amount;
                    summary.totalCashExpense += movement.amount;
                }
            }
        }
        for (const method of paymentMethods) {
            const methodKey = method;
            summary[methodKey].balance =
                summary[methodKey].income -
                    summary[methodKey].expense;
        }
        summary.totalCashBalance = summary.totalCashIncome - summary.totalCashExpense;
        return summary;
    }
    buildWhereClauseForSummary(query) {
        const where = {};
        if (query.startDate && query.endDate) {
            where.date = (0, typeorm_2.Between)(query.startDate, query.startDate);
        }
        if (query.typeMovement) {
            where.typeMovement = query.typeMovement;
        }
        if (query.paymentsMethod) {
            where.paymentsMethod = query.paymentsMethod;
        }
        if (query.userId) {
            where.user = { id: query.userId };
        }
        return where;
    }
};
exports.CashManagementService = CashManagementService;
exports.CashManagementService = CashManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cashManagement_entity_1.CashManagementEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], CashManagementService);
//# sourceMappingURL=cashManagement.service.js.map