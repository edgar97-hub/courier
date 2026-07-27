import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { FulfillmentProductEntity } from '../entities/fulfillment-product.entity';
import { ProductVariationEntity } from '../entities/product-variation.entity';
import { CreateFulfillmentProductDto } from '../dto/create-fulfillment-product.dto';

export interface PaginatedProducts {
  items: FulfillmentProductEntity[];
  total_count: number;
  page_number: number;
  page_size: number;
}

@Injectable()
export class FulfillmentService {
  constructor(
    @InjectRepository(FulfillmentProductEntity)
    private readonly productRepository: Repository<FulfillmentProductEntity>,
    @InjectRepository(ProductVariationEntity)
    private readonly variationRepository: Repository<ProductVariationEntity>,
  ) {}

  async create(
    dto: CreateFulfillmentProductDto,
  ): Promise<FulfillmentProductEntity> {
    const { variations, ...productData } = dto;

    // Check for duplicate SKUs
    if (variations && variations.length > 0) {
      const skus = variations.map((v) => v.sku).filter(Boolean);
      if (skus.length > 0) {
        const existing = await this.variationRepository.findOne({
          where: skus.map((sku) => ({ sku })),
        });
        if (existing) {
          throw new ConflictException(
            `El SKU "${existing.sku}" ya existe en otro producto`,
          );
        }
      }
    }

    const product = this.productRepository.create(productData);
    const savedProduct = await this.productRepository.save(product);

    if (variations && variations.length > 0) {
      const variationEntities = variations.map((v) =>
        this.variationRepository.create({
          ...v,
          product_id: savedProduct.id,
        }),
      );
      await this.variationRepository.save(variationEntities);
    }

    return this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['variations', 'company'],
    }) as Promise<FulfillmentProductEntity>;
  }

  async findAll(): Promise<FulfillmentProductEntity[]> {
    return this.productRepository.find({
      relations: ['variations', 'company'],
      order: { createdAt: 'DESC' },
    });
  }

  async findProductsPaginated(options: {
    page_number: number;
    page_size: number;
    sort_field: string;
    sort_direction: 'ASC' | 'DESC';
    search_term: string;
  }): Promise<PaginatedProducts> {
    const { page_number, page_size, sort_field, sort_direction, search_term } =
      options;
    const skip = (page_number - 1) * page_size;

    const queryBuilder = this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.variations', 'variations')
      .leftJoinAndSelect('p.company', 'company');

    if (search_term) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
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
        }),
      );
    }

    const sortFieldMap: Record<string, string> = {
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

  async findDistinctProductNames(): Promise<string[]> {
    const products = await this.productRepository
      .createQueryBuilder('p')
      .select('p.name', 'name')
      .distinct(true)
      .orderBy('p.name', 'ASC')
      .getRawMany();
    return products.map((p) => p.name);
  }

  async findDistinctVariationValues(): Promise<{
    colors: string[];
    sizes: string[];
    models: string[];
  }> {
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

  async findOne(id: string): Promise<FulfillmentProductEntity> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['variations', 'company'],
    }) as Promise<FulfillmentProductEntity>;
  }

  async update(
    id: string,
    dto: Partial<CreateFulfillmentProductDto>,
  ): Promise<FulfillmentProductEntity> {
    const { variations, ...productData } = dto;

    // Check for duplicate SKUs (excluding current product's variations)
    if (variations && variations.length > 0) {
      const skus = variations.map((v) => v.sku).filter(Boolean);
      if (skus.length > 0) {
        const existing = await this.variationRepository
          .createQueryBuilder('v')
          .where('v.sku IN (:...skus)', { skus })
          .andWhere('v.product_id != :id', { id })
          .getOne();
        if (existing) {
          throw new ConflictException(
            `El SKU "${existing.sku}" ya existe en otro producto`,
          );
        }
      }
    }

    await this.productRepository.update(id, productData);

    if (variations) {
      for (const v of variations) {
        if (v.id) {
          // Update existing variation (preserves inventory/kardex references)
          const { id: variationId, ...updateData } = v;
          await this.variationRepository.update(variationId, updateData);
        } else {
          // Create new variation
          const newVariation = this.variationRepository.create({
            ...v,
            product_id: id,
          });
          await this.variationRepository.save(newVariation);
        }
      }
    }

    return this.productRepository.findOne({
      where: { id },
      relations: ['variations', 'company'],
    }) as Promise<FulfillmentProductEntity>;
  }

  async remove(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }
}
