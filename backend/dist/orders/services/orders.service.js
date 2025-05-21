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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const error_manager_1 = require("../../utils/error.manager");
const typeorm_2 = require("typeorm");
const orders_entity_1 = require("../entities/orders.entity");
let OrdersService = class OrdersService {
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
    async batchCreateOrders(payload) {
        const { orders: orderDTOs } = payload;
        if (!orderDTOs || orderDTOs.length === 0) {
            throw error_manager_1.ErrorManager.createSignatureError('No orders provided in the batch.');
        }
        const queryRunner = this.userRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const createdOrders = [];
        const operationErrors = [];
        try {
            for (const orderDto of orderDTOs) {
                try {
                    const orderToCreate = new orders_entity_1.OrdersEntity();
                    orderToCreate.shipment_type = orderDto.shipment_type;
                    orderToCreate.recipient_name = orderDto.recipient_name;
                    orderToCreate.recipient_phone = orderDto.recipient_phone;
                    orderToCreate.delivery_district_name =
                        orderDto.delivery_district_name;
                    orderToCreate.delivery_address = orderDto.delivery_address;
                    orderToCreate.delivery_coordinates = orderDto.delivery_coordinates;
                    orderToCreate.delivery_date = orderDto.delivery_date;
                    orderToCreate.package_size_type = orderDto.package_size_type;
                    orderToCreate.package_width_cm = orderDto.package_width_cm;
                    orderToCreate.package_length_cm = orderDto.package_length_cm;
                    orderToCreate.package_height_cm = orderDto.package_height_cm;
                    orderToCreate.package_weight_kg = orderDto.package_weight_kg;
                    orderToCreate.shipping_cost = orderDto.shipping_cost;
                    orderToCreate.item_description = orderDto.item_description;
                    orderToCreate.amount_to_collect_at_delivery =
                        orderDto.amount_to_collect_at_delivery;
                    orderToCreate.payment_method_for_collection =
                        orderDto.payment_method_for_collection;
                    orderToCreate.observations = orderDto.observations;
                    orderToCreate.type_order_transfer_to_warehouse =
                        orderDto.type_order_transfer_to_warehouse;
                    const savedOrder = await queryRunner.manager.save(orders_entity_1.OrdersEntity, orderToCreate);
                    createdOrders.push(savedOrder);
                }
                catch (individualError) {
                    console.error('Error saving individual order in batch:', individualError, 'Order DTO:', orderDto);
                    operationErrors.push({
                        orderData: orderDto,
                        error: individualError.message,
                    });
                }
            }
            if (operationErrors.length > 0 &&
                operationErrors.length === orderDTOs.length) {
                throw new Error('All orders in the batch failed to save.');
            }
            await queryRunner.commitTransaction();
            console.log('Batch orders created successfully (or partially, if errors occurred and were handled).');
            return {
                success: true,
                message: operationErrors.length > 0
                    ? `Batch processed with ${operationErrors.length} errors.`
                    : 'All orders created successfully.',
                createdOrders: createdOrders,
                errors: operationErrors.length > 0 ? operationErrors : undefined,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error during batch order creation, transaction rolled back:', error);
            return {
                success: false,
                message: `Batch creation failed: ${error.message}`,
                errors: [
                    { generalError: error.message, individualErrors: operationErrors },
                ],
            };
        }
        finally {
            await queryRunner.release();
        }
    }
    async findUsers({ pageNumber = 1, pageSize = 1, sortField = '', sortDirection = '', startDate, endDate, }) {
        try {
            const skip = (pageNumber - 1) * pageSize;
            const where = {};
            if (startDate && endDate) {
                const [startY, startM, startD] = startDate.split('-').map(Number);
                const [endY, endM, endD] = endDate.split('-').map(Number);
                const start = new Date(startY, startM - 1, startD, 0, 0, 0);
                const end = new Date(endY, endM - 1, endD, 23, 59, 59);
                where.createdAt = (0, typeorm_2.Between)(start, end);
            }
            const sortFieldMap = {
                registration_date: 'createdAt',
            };
            const sortBy = sortFieldMap[sortField] || sortField;
            return this.userRepository
                .findAndCount({
                where,
                order: {
                    [sortBy]: sortDirection.toUpperCase(),
                },
                skip,
                take: pageSize,
            })
                .then(([items, total]) => ({
                items,
                total_count: total,
                page_number: pageNumber,
                page_size: pageSize,
            }));
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
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orders_entity_1.OrdersEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map