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
exports.FulfillmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fulfillment_product_entity_1 = require("../entities/fulfillment-product.entity");
const product_variation_entity_1 = require("../entities/product-variation.entity");
const inventory_entity_1 = require("../entities/inventory.entity");
const stock_adjustment_entity_1 = require("../entities/stock-adjustment.entity");
const kardex_entity_1 = require("../entities/kardex.entity");
const stock_adjustment_entity_2 = require("../entities/stock-adjustment.entity");
const order_item_entity_1 = require("../../orders/entities/order-item.entity");
const stock_adjustment_service_1 = require("./stock-adjustment.service");
let FulfillmentService = class FulfillmentService {
    constructor(productRepository, variationRepository, inventoryRepository, adjustmentRepository, kardexRepository, stockAdjustmentService, dataSource) {
        this.productRepository = productRepository;
        this.variationRepository = variationRepository;
        this.inventoryRepository = inventoryRepository;
        this.adjustmentRepository = adjustmentRepository;
        this.kardexRepository = kardexRepository;
        this.stockAdjustmentService = stockAdjustmentService;
        this.dataSource = dataSource;
    }
    async create(dto) {
        const { variations, ...productData } = dto;
        if (variations && variations.length > 0) {
            const skus = variations.map((v) => v.sku).filter(Boolean);
            if (skus.length > 0) {
                const existing = await this.variationRepository.findOne({
                    where: skus.map((sku) => ({ sku })),
                });
                if (existing) {
                    throw new common_1.ConflictException(`El SKU "${existing.sku}" ya existe en otro producto`);
                }
            }
        }
        const queryRunner = this.productRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const product = queryRunner.manager.create(fulfillment_product_entity_1.FulfillmentProductEntity, productData);
            const savedProduct = await queryRunner.manager.save(fulfillment_product_entity_1.FulfillmentProductEntity, product);
            if (variations && variations.length > 0) {
                const variationEntities = variations.map((v) => {
                    const { initial_stock, ...variationData } = v;
                    return queryRunner.manager.create(product_variation_entity_1.ProductVariationEntity, {
                        ...variationData,
                        product_id: savedProduct.id,
                    });
                });
                const savedVariations = await queryRunner.manager.save(product_variation_entity_1.ProductVariationEntity, variationEntities);
                const initialStockIndexes = variations.reduce((acc, v, i) => {
                    const initialStock = Number(v.initial_stock) || 0;
                    if (initialStock > 0)
                        acc.push(i);
                    return acc;
                }, []);
                if (initialStockIndexes.length > 0) {
                    const warehouse = await this.stockAdjustmentService.getMainWarehouse();
                    for (const i of initialStockIndexes) {
                        await this.stockAdjustmentService.create({
                            adjustment_type: stock_adjustment_entity_2.ADJUSTMENT_TYPE.INBOUND,
                            quantity: Number(variations[i].initial_stock),
                            observation: 'Stock inicial al crear producto',
                            company_id: productData.company_id,
                            product_id: savedProduct.id,
                            variation_id: savedVariations[i].id,
                            warehouse_id: warehouse.id,
                        }, undefined, queryRunner.manager);
                    }
                }
            }
            await queryRunner.commitTransaction();
            return this.productRepository.findOne({
                where: { id: savedProduct.id },
                relations: ['variations', 'company'],
            });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.throwFriendlyDuplicateError(error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll() {
        return this.productRepository.find({
            relations: ['variations', 'company'],
            order: { createdAt: 'DESC' },
        });
    }
    async findProductsPaginated(options) {
        const { page_number, page_size, sort_field, sort_direction, search_term } = options;
        const skip = (page_number - 1) * page_size;
        const queryBuilder = this.productRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.variations', 'variations')
            .leftJoinAndSelect('p.company', 'company');
        if (search_term) {
            queryBuilder.andWhere(new typeorm_2.Brackets((qb) => {
                qb.where('p.name ILIKE :search', { search: `%${search_term}%` })
                    .orWhere('p.description ILIKE :search', {
                    search: `%${search_term}%`,
                })
                    .orWhere('CAST(p.code AS TEXT) ILIKE :search', {
                    search: `%${search_term}%`,
                })
                    .orWhere('company.username ILIKE :search', {
                    search: `%${search_term}%`,
                });
            }));
        }
        const sortFieldMap = {
            code: 'p.code',
            name: 'p.name',
            description: 'p.description',
            createdAt: 'p.createdAt',
        };
        const sortBy = sortFieldMap[sort_field] || `p.${sort_field}`;
        queryBuilder.orderBy(sortBy, sort_direction).skip(skip).take(page_size);
        const [items, total_count] = await queryBuilder.getManyAndCount();
        return { items, total_count, page_number, page_size };
    }
    async findDistinctProductNames() {
        const products = await this.productRepository
            .createQueryBuilder('p')
            .select('p.name', 'name')
            .distinct(true)
            .orderBy('p.name', 'ASC')
            .getRawMany();
        return products.map((p) => p.name);
    }
    async findDistinctVariationValues() {
        const colors = await this.variationRepository
            .createQueryBuilder('v')
            .select('v.color', 'color')
            .where('v.color IS NOT NULL AND v.color != :empty', { empty: '' })
            .distinct(true)
            .orderBy('v.color', 'ASC')
            .getRawMany();
        const sizes = await this.variationRepository
            .createQueryBuilder('v')
            .select('v.size', 'size')
            .where('v.size IS NOT NULL AND v.size != :empty', { empty: '' })
            .distinct(true)
            .orderBy('v.size', 'ASC')
            .getRawMany();
        const models = await this.variationRepository
            .createQueryBuilder('v')
            .select('v.model', 'model')
            .where('v.model IS NOT NULL AND v.model != :empty', { empty: '' })
            .distinct(true)
            .orderBy('v.model', 'ASC')
            .getRawMany();
        return {
            colors: colors.map((c) => c.color),
            sizes: sizes.map((s) => s.size),
            models: models.map((m) => m.model),
        };
    }
    async findOne(id) {
        return this.productRepository.findOne({
            where: { id },
            relations: ['variations', 'company'],
        });
    }
    async update(id, dto) {
        const { variations, ...productData } = dto;
        if (variations && variations.length > 0) {
            const skus = variations.map((v) => v.sku).filter(Boolean);
            if (skus.length > 0) {
                const existing = await this.variationRepository
                    .createQueryBuilder('v')
                    .where('v.sku IN (:...skus)', { skus })
                    .andWhere('v.product_id != :id', { id })
                    .getOne();
                if (existing) {
                    throw new common_1.ConflictException(`El SKU "${existing.sku}" ya existe en otro producto`);
                }
            }
        }
        const queryRunner = this.productRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.update(fulfillment_product_entity_1.FulfillmentProductEntity, id, productData);
            if (variations) {
                for (const v of variations) {
                    if (v.id) {
                        const { id: variationId, initial_stock, ...updateData } = v;
                        await queryRunner.manager.update(product_variation_entity_1.ProductVariationEntity, variationId, updateData);
                    }
                    else {
                        const { initial_stock, ...variationData } = v;
                        const newVariation = queryRunner.manager.create(product_variation_entity_1.ProductVariationEntity, {
                            ...variationData,
                            product_id: id,
                        });
                        await queryRunner.manager.save(product_variation_entity_1.ProductVariationEntity, newVariation);
                    }
                }
                const existingVariations = await queryRunner.manager.find(product_variation_entity_1.ProductVariationEntity, { where: { product_id: id } });
                const keptIds = new Set(variations.filter((v) => v.id).map((v) => v.id));
                const removed = existingVariations.filter((v) => !keptIds.has(v.id));
                if (removed.length > 0) {
                    const reasons = await this.getVariationBlockReasons(removed.map((v) => v.id));
                    if (reasons.length > 0) {
                        const labels = {
                            stock: 'tiene stock registrado',
                            movimientos: 'tiene movimientos de stock asociados',
                            ordenes: 'está vinculada a órdenes existentes',
                        };
                        const skuLabel = removed
                            .map((v) => `[${v.sku}]`)
                            .join(', ');
                        throw new common_1.BadRequestException(`No se puede eliminar la variación ${skuLabel}: ${reasons
                            .map((r) => labels[r])
                            .join(', ')}.`);
                    }
                    await queryRunner.manager.remove(product_variation_entity_1.ProductVariationEntity, removed);
                }
            }
            await queryRunner.commitTransaction();
            return this.productRepository.findOne({
                where: { id },
                relations: ['variations', 'company'],
            });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.throwFriendlyDuplicateError(error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    throwFriendlyDuplicateError(error) {
        if (error?.code === '23505') {
            throw new common_1.ConflictException('El SKU ya existe en otro producto. Verifique que cada variación tenga un SKU único.');
        }
    }
    async checkVariationDeletable(variationId) {
        const variation = await this.variationRepository.findOne({
            where: { id: variationId },
        });
        if (!variation) {
            throw new common_1.NotFoundException('Variación no encontrada');
        }
        const reasons = await this.getVariationBlockReasons([variationId]);
        return { deletable: reasons.length === 0, reasons };
    }
    async getVariationBlockReasons(variationIds, productId) {
        const reasons = [];
        if (variationIds.length === 0)
            return reasons;
        const stockCount = await this.inventoryRepository
            .createQueryBuilder('inv')
            .where('inv.variation_id IN (:...variationIds)', { variationIds })
            .andWhere('inv.stock > 0')
            .getCount();
        if (stockCount > 0)
            reasons.push('stock');
        const movementCount = await this.adjustmentRepository
            .createQueryBuilder('sa')
            .where('sa.product_id = :productId', { productId })
            .orWhere('sa.variation_id IN (:...variationIds)', { variationIds })
            .getCount();
        const kardexCount = await this.kardexRepository
            .createQueryBuilder('k')
            .where('k.product_id = :productId', { productId })
            .orWhere('k.variation_id IN (:...variationIds)', { variationIds })
            .getCount();
        if (movementCount > 0 || kardexCount > 0)
            reasons.push('movimientos');
        const orderItemRepository = this.dataSource.getRepository(order_item_entity_1.OrderItemEntity);
        const orderCount = await orderItemRepository
            .createQueryBuilder('oi')
            .where('oi.product_id = :productId', { productId })
            .orWhere('oi.variation_id IN (:...variationIds)', { variationIds })
            .getCount();
        if (orderCount > 0)
            reasons.push('ordenes');
        return reasons;
    }
    async remove(id) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['variations'],
        });
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        const variationIds = product.variations.map((v) => v.id);
        const reasons = await this.getVariationBlockReasons(variationIds, id);
        if (reasons.includes('stock')) {
            throw new common_1.BadRequestException('No se puede eliminar el producto porque tiene stock registrado. Primero gestione su inventario.');
        }
        if (reasons.includes('movimientos')) {
            throw new common_1.BadRequestException('No se puede eliminar el producto porque tiene movimientos de stock asociados.');
        }
        if (reasons.includes('ordenes')) {
            throw new common_1.BadRequestException('No se puede eliminar el producto porque está vinculado a órdenes existentes.');
        }
        await this.productRepository.delete(id);
    }
};
exports.FulfillmentService = FulfillmentService;
exports.FulfillmentService = FulfillmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fulfillment_product_entity_1.FulfillmentProductEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(product_variation_entity_1.ProductVariationEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(inventory_entity_1.InventoryEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(stock_adjustment_entity_1.StockAdjustmentEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(kardex_entity_1.KardexEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        stock_adjustment_service_1.StockAdjustmentService,
        typeorm_2.DataSource])
], FulfillmentService);
//# sourceMappingURL=products.service.js.map