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
let FulfillmentService = class FulfillmentService {
    constructor(productRepository, variationRepository) {
        this.productRepository = productRepository;
        this.variationRepository = variationRepository;
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
                const variationEntities = variations.map((v) => queryRunner.manager.create(product_variation_entity_1.ProductVariationEntity, {
                    ...v,
                    product_id: savedProduct.id,
                }));
                await queryRunner.manager.save(product_variation_entity_1.ProductVariationEntity, variationEntities);
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
                        const { id: variationId, ...updateData } = v;
                        await queryRunner.manager.update(product_variation_entity_1.ProductVariationEntity, variationId, updateData);
                    }
                    else {
                        const newVariation = queryRunner.manager.create(product_variation_entity_1.ProductVariationEntity, {
                            ...v,
                            product_id: id,
                        });
                        await queryRunner.manager.save(product_variation_entity_1.ProductVariationEntity, newVariation);
                    }
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
    async remove(id) {
        await this.productRepository.delete(id);
    }
};
exports.FulfillmentService = FulfillmentService;
exports.FulfillmentService = FulfillmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fulfillment_product_entity_1.FulfillmentProductEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(product_variation_entity_1.ProductVariationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FulfillmentService);
//# sourceMappingURL=products.service.js.map