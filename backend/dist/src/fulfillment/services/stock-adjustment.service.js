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
exports.StockAdjustmentService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_adjustment_entity_1 = require("../entities/stock-adjustment.entity");
const inventory_entity_1 = require("../entities/inventory.entity");
const fulfillment_product_entity_1 = require("../entities/fulfillment-product.entity");
const product_variation_entity_1 = require("../entities/product-variation.entity");
const warehouse_entity_1 = require("../entities/warehouse.entity");
const kardex_service_1 = require("./kardex.service");
const kardex_entity_1 = require("../entities/kardex.entity");
let StockAdjustmentService = class StockAdjustmentService {
    constructor(adjustmentRepository, inventoryRepository, productRepository, variationRepository, warehouseRepository, kardexService) {
        this.adjustmentRepository = adjustmentRepository;
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.variationRepository = variationRepository;
        this.warehouseRepository = warehouseRepository;
        this.kardexService = kardexService;
    }
    async create(dto, userId, manager) {
        if (manager) {
            return this.createWithManager(dto, userId, manager);
        }
        const queryRunner = this.inventoryRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const saved = await this.createWithManager(dto, userId, queryRunner.manager);
            await queryRunner.commitTransaction();
            return saved;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createWithManager(dto, userId, manager) {
        let inventory = await manager.findOne(inventory_entity_1.InventoryEntity, {
            where: {
                variation_id: dto.variation_id,
                warehouse_id: dto.warehouse_id,
            },
        });
        if (!inventory) {
            inventory = manager.create(inventory_entity_1.InventoryEntity, {
                variation_id: dto.variation_id,
                warehouse_id: dto.warehouse_id,
                stock: 0,
            });
            await manager.save(inventory_entity_1.InventoryEntity, inventory);
        }
        const stockBefore = inventory.stock;
        let stockAfter = stockBefore;
        switch (dto.adjustment_type) {
            case stock_adjustment_entity_1.ADJUSTMENT_TYPE.INBOUND:
            case stock_adjustment_entity_1.ADJUSTMENT_TYPE.MANUAL_ADD:
                stockAfter = stockBefore + dto.quantity;
                break;
            case stock_adjustment_entity_1.ADJUSTMENT_TYPE.MANUAL_SUBTRACT:
                if (stockBefore < dto.quantity) {
                    throw new common_2.BadRequestException(`Stock insuficiente. Stock actual: ${stockBefore}, cantidad a restar: ${dto.quantity}`);
                }
                stockAfter = stockBefore - dto.quantity;
                break;
        }
        await manager.update(inventory_entity_1.InventoryEntity, inventory.id, {
            stock: stockAfter,
        });
        const adjustment = manager.create(stock_adjustment_entity_1.StockAdjustmentEntity, {
            adjustment_type: dto.adjustment_type,
            quantity: dto.quantity,
            observation: dto.observation,
            company_id: dto.company_id,
            product_id: dto.product_id,
            variation_id: dto.variation_id,
            warehouse_id: dto.warehouse_id,
            status: stock_adjustment_entity_1.ADJUSTMENT_STATUS.REGISTERED,
        });
        const saved = await manager.save(stock_adjustment_entity_1.StockAdjustmentEntity, adjustment);
        const movementTypeMap = {
            [stock_adjustment_entity_1.ADJUSTMENT_TYPE.INBOUND]: kardex_entity_1.KARDEX_MOVEMENT_TYPE.INBOUND,
            [stock_adjustment_entity_1.ADJUSTMENT_TYPE.MANUAL_ADD]: kardex_entity_1.KARDEX_MOVEMENT_TYPE.MANUAL_ADD,
            [stock_adjustment_entity_1.ADJUSTMENT_TYPE.MANUAL_SUBTRACT]: kardex_entity_1.KARDEX_MOVEMENT_TYPE.MANUAL_SUBTRACT,
        };
        await this.kardexService.create({
            movement_type: movementTypeMap[dto.adjustment_type] ||
                kardex_entity_1.KARDEX_MOVEMENT_TYPE.MANUAL_ADD,
            quantity: dto.quantity,
            stock_before: stockBefore,
            stock_after: stockAfter,
            observation: dto.observation,
            responsible_user_id: userId,
            reference_id: saved.id,
            reference_type: 'stock_adjustment',
            company_id: dto.company_id,
            product_id: dto.product_id,
            variation_id: dto.variation_id,
            warehouse_id: dto.warehouse_id,
        }, manager);
        return saved;
    }
    async findPaginated(options) {
        const { page_number, page_size, sort_field, sort_direction, search_term } = options;
        const skip = (page_number - 1) * page_size;
        const queryBuilder = this.adjustmentRepository
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.company', 'company')
            .leftJoinAndSelect('a.product', 'product')
            .leftJoinAndSelect('a.variation', 'variation')
            .leftJoinAndSelect('a.warehouse', 'warehouse');
        if (search_term) {
            const term = `%${search_term}%`;
            const lower = search_term.toLowerCase();
            const matches = (word) => word.startsWith(lower);
            queryBuilder.andWhere(new typeorm_2.Brackets((qb) => {
                qb.where('company.username ILIKE :search', { search: term })
                    .orWhere('product.name ILIKE :search', { search: term })
                    .orWhere('CAST(variation.sku AS TEXT) ILIKE :search', {
                    search: term,
                })
                    .orWhere('a.observation ILIKE :search', { search: term })
                    .orWhere('CAST(a.code AS TEXT) ILIKE :search', { search: term })
                    .orWhere('CAST(a.quantity AS TEXT) ILIKE :search', { search: term })
                    .orWhere('CAST(a.adjustment_type AS TEXT) ILIKE :search', {
                    search: term,
                })
                    .orWhere('CAST(a.status AS TEXT) ILIKE :search', { search: term });
                if (matches('ingreso')) {
                    qb.orWhere(`a.adjustment_type = '${stock_adjustment_entity_1.ADJUSTMENT_TYPE.INBOUND}'`);
                }
                if (matches('ajuste')) {
                    qb.orWhere(`a.adjustment_type IN ('${stock_adjustment_entity_1.ADJUSTMENT_TYPE.MANUAL_ADD}', '${stock_adjustment_entity_1.ADJUSTMENT_TYPE.MANUAL_SUBTRACT}')`);
                }
                if (matches('suma')) {
                    qb.orWhere(`a.adjustment_type = '${stock_adjustment_entity_1.ADJUSTMENT_TYPE.MANUAL_ADD}'`);
                }
                if (matches('resta')) {
                    qb.orWhere(`a.adjustment_type = '${stock_adjustment_entity_1.ADJUSTMENT_TYPE.MANUAL_SUBTRACT}'`);
                }
                if (matches('registrado')) {
                    qb.orWhere(`a.status = '${stock_adjustment_entity_1.ADJUSTMENT_STATUS.REGISTERED}'`);
                }
                if (matches('anulado')) {
                    qb.orWhere(`a.status = '${stock_adjustment_entity_1.ADJUSTMENT_STATUS.ANNULLED}'`);
                }
            }));
        }
        const sortFieldMap = {
            createdAt: 'a.createdAt',
            adjustment_type: 'a.adjustment_type',
            quantity: 'a.quantity',
            observation: 'a.observation',
            status: 'a.status',
        };
        const sortBy = sortFieldMap[sort_field] || 'a.createdAt';
        queryBuilder.orderBy(sortBy, sort_direction).skip(skip).take(page_size);
        const [items, total_count] = await queryBuilder.getManyAndCount();
        return { items, total_count, page_number, page_size };
    }
    async getProductsByCompany(companyId) {
        return this.productRepository.find({
            where: { company_id: companyId },
            order: { name: 'ASC' },
        });
    }
    async getVariationsByProduct(productId) {
        return this.variationRepository.find({
            where: { product_id: productId },
            order: { sku: 'ASC' },
        });
    }
    async getMainWarehouse() {
        const warehouse = await this.warehouseRepository.findOne({
            where: { is_main: true },
        });
        if (!warehouse) {
            throw new common_2.NotFoundException('No se encontró un almacén principal. Contacte al administrador.');
        }
        return warehouse;
    }
    async annul(id, userId) {
        const queryRunner = this.adjustmentRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const adjustment = await queryRunner.manager.findOne(stock_adjustment_entity_1.StockAdjustmentEntity, {
                where: { id },
                lock: { mode: 'pessimistic_write' },
            });
            if (!adjustment) {
                throw new common_2.BadRequestException('Ajuste de stock no encontrado');
            }
            if (adjustment.status === stock_adjustment_entity_1.ADJUSTMENT_STATUS.ANNULLED) {
                throw new common_2.BadRequestException('Este ajuste ya está anulado');
            }
            const inventory = await queryRunner.manager.findOne(inventory_entity_1.InventoryEntity, {
                where: {
                    variation_id: adjustment.variation_id,
                    warehouse_id: adjustment.warehouse_id,
                },
                lock: { mode: 'pessimistic_write' },
            });
            let stockBefore = 0;
            let stockAfter = 0;
            if (inventory) {
                stockBefore = inventory.stock;
                stockAfter = inventory.stock;
                switch (adjustment.adjustment_type) {
                    case stock_adjustment_entity_1.ADJUSTMENT_TYPE.INBOUND:
                    case stock_adjustment_entity_1.ADJUSTMENT_TYPE.MANUAL_ADD:
                        stockAfter = inventory.stock - adjustment.quantity;
                        break;
                    case stock_adjustment_entity_1.ADJUSTMENT_TYPE.MANUAL_SUBTRACT:
                        stockAfter = inventory.stock + adjustment.quantity;
                        break;
                }
                if (stockAfter < 0) {
                    throw new common_2.BadRequestException('No se puede anular: el stock actual no permite la reversión (resultaría en stock negativo)');
                }
                await queryRunner.manager.update(inventory_entity_1.InventoryEntity, inventory.id, {
                    stock: stockAfter,
                });
            }
            adjustment.status = stock_adjustment_entity_1.ADJUSTMENT_STATUS.ANNULLED;
            const saved = await queryRunner.manager.save(stock_adjustment_entity_1.StockAdjustmentEntity, adjustment);
            await this.kardexService.create({
                movement_type: kardex_entity_1.KARDEX_MOVEMENT_TYPE.ANNUL_REVERSAL,
                quantity: adjustment.quantity,
                stock_before: stockBefore,
                stock_after: stockAfter,
                observation: `Anulación de ajuste #${saved.code || saved.id}`,
                responsible_user_id: userId || 'Administrador',
                reference_id: saved.id,
                reference_type: 'stock_adjustment_annul',
                company_id: adjustment.company_id,
                product_id: adjustment.product_id,
                variation_id: adjustment.variation_id,
                warehouse_id: adjustment.warehouse_id,
            }, queryRunner.manager);
            await queryRunner.commitTransaction();
            return saved;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.StockAdjustmentService = StockAdjustmentService;
exports.StockAdjustmentService = StockAdjustmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_adjustment_entity_1.StockAdjustmentEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(inventory_entity_1.InventoryEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(fulfillment_product_entity_1.FulfillmentProductEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(product_variation_entity_1.ProductVariationEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(warehouse_entity_1.WarehouseEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        kardex_service_1.KardexService])
], StockAdjustmentService);
//# sourceMappingURL=stock-adjustment.service.js.map