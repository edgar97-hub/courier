import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, QueryRunner, DataSource } from 'typeorm';
import { FulfillmentProductEntity } from '../entities/fulfillment-product.entity';
import { ProductVariationEntity } from '../entities/product-variation.entity';
import { InventoryEntity } from '../entities/inventory.entity';
import { StockAdjustmentEntity } from '../entities/stock-adjustment.entity';
import { KardexEntity } from '../entities/kardex.entity';
import { ADJUSTMENT_TYPE } from '../entities/stock-adjustment.entity';
import { OrderItemEntity } from '../../orders/entities/order-item.entity';
import { CreateFulfillmentProductDto } from '../dto/create-fulfillment-product.dto';
import { StockAdjustmentService } from './stock-adjustment.service';

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
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(StockAdjustmentEntity)
    private readonly adjustmentRepository: Repository<StockAdjustmentEntity>,
    @InjectRepository(KardexEntity)
    private readonly kardexRepository: Repository<KardexEntity>,
    private readonly stockAdjustmentService: StockAdjustmentService,
    private readonly dataSource: DataSource,
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

    const queryRunner: QueryRunner =
      this.productRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = queryRunner.manager.create(
        FulfillmentProductEntity,
        productData,
      );
      const savedProduct = await queryRunner.manager.save(
        FulfillmentProductEntity,
        product,
      );

      if (variations && variations.length > 0) {
        const variationEntities = variations.map((v) => {
          const { initial_stock, ...variationData } = v;
          return queryRunner.manager.create(ProductVariationEntity, {
            ...variationData,
            product_id: savedProduct.id,
          });
        });
        const savedVariations = await queryRunner.manager.save(
          ProductVariationEntity,
          variationEntities,
        );

        const initialStockIndexes = variations.reduce<number[]>(
          (acc, v, i) => {
            const initialStock = Number(v.initial_stock) || 0;
            if (initialStock > 0) acc.push(i);
            return acc;
          },
          [],
        );

        if (initialStockIndexes.length > 0) {
          const warehouse =
            await this.stockAdjustmentService.getMainWarehouse();

          for (const i of initialStockIndexes) {
            await this.stockAdjustmentService.create(
              {
                adjustment_type: ADJUSTMENT_TYPE.INBOUND,
                quantity: Number(variations[i].initial_stock),
                observation: 'Stock inicial al crear producto',
                company_id: productData.company_id,
                product_id: savedProduct.id,
                variation_id: savedVariations[i].id,
                warehouse_id: warehouse.id,
              },
              undefined,
              queryRunner.manager,
            );
          }
        }
      }

      await queryRunner.commitTransaction();

      return this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['variations', 'company'],
      }) as Promise<FulfillmentProductEntity>;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      this.throwFriendlyDuplicateError(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
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

    const queryRunner: QueryRunner =
      this.productRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        FulfillmentProductEntity,
        id,
        productData,
      );

      if (variations) {
        for (const v of variations) {
          if (v.id) {
            // Update existing variation (preserves inventory/kardex references)
            const { id: variationId, initial_stock, ...updateData } = v;
            await queryRunner.manager.update(
              ProductVariationEntity,
              variationId,
              updateData,
            );
          } else {
            // Create new variation
            const { initial_stock, ...variationData } = v;
            const newVariation = queryRunner.manager.create(
              ProductVariationEntity,
              {
                ...variationData,
                product_id: id,
              },
            );
            await queryRunner.manager.save(
              ProductVariationEntity,
              newVariation,
            );
          }
        }

        // Delete variations removed from the form, validating they can be removed
        const existingVariations = await queryRunner.manager.find(
          ProductVariationEntity,
          { where: { product_id: id } },
        );
        const keptIds = new Set(
          variations.filter((v) => v.id).map((v) => v.id),
        );
        const removed = existingVariations.filter((v) => !keptIds.has(v.id));

        if (removed.length > 0) {
          const reasons = await this.getVariationBlockReasons(
            removed.map((v) => v.id),
          );

          if (reasons.length > 0) {
            const labels: Record<string, string> = {
              stock: 'tiene stock registrado',
              movimientos: 'tiene movimientos de stock asociados',
              ordenes: 'está vinculada a órdenes existentes',
            };
            const skuLabel = removed
              .map((v) => `[${v.sku}]`)
              .join(', ');
            throw new BadRequestException(
              `No se puede eliminar la variación ${skuLabel}: ${reasons
                .map((r) => labels[r])
                .join(', ')}.`,
            );
          }

          await queryRunner.manager.remove(
            ProductVariationEntity,
            removed,
          );
        }
      }

      await queryRunner.commitTransaction();

      return this.productRepository.findOne({
        where: { id },
        relations: ['variations', 'company'],
      }) as Promise<FulfillmentProductEntity>;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      this.throwFriendlyDuplicateError(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private throwFriendlyDuplicateError(error: any): void {
    // PostgreSQL unique violation code: 23505
    if (error?.code === '23505') {
      throw new ConflictException(
        'El SKU ya existe en otro producto. Verifique que cada variación tenga un SKU único.',
      );
    }
  }

  async checkVariationDeletable(
    variationId: string,
  ): Promise<{ deletable: boolean; reasons: string[] }> {
    const variation = await this.variationRepository.findOne({
      where: { id: variationId },
    });

    if (!variation) {
      throw new NotFoundException('Variación no encontrada');
    }

    const reasons = await this.getVariationBlockReasons([variationId]);
    return { deletable: reasons.length === 0, reasons };
  }

  private async getVariationBlockReasons(
    variationIds: string[],
    productId?: string,
  ): Promise<string[]> {
    const reasons: string[] = [];
    if (variationIds.length === 0) return reasons;

    const stockCount = await this.inventoryRepository
      .createQueryBuilder('inv')
      .where('inv.variation_id IN (:...variationIds)', { variationIds })
      .andWhere('inv.stock > 0')
      .getCount();
    if (stockCount > 0) reasons.push('stock');

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
    if (movementCount > 0 || kardexCount > 0) reasons.push('movimientos');

    const orderItemRepository =
      this.dataSource.getRepository(OrderItemEntity);
    const orderCount = await orderItemRepository
      .createQueryBuilder('oi')
      .where('oi.product_id = :productId', { productId })
      .orWhere('oi.variation_id IN (:...variationIds)', { variationIds })
      .getCount();
    if (orderCount > 0) reasons.push('ordenes');

    return reasons;
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variations'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const variationIds = product.variations.map((v) => v.id);
    const reasons = await this.getVariationBlockReasons(variationIds, id);

    if (reasons.includes('stock')) {
      throw new BadRequestException(
        'No se puede eliminar el producto porque tiene stock registrado. Primero gestione su inventario.',
      );
    }
    if (reasons.includes('movimientos')) {
      throw new BadRequestException(
        'No se puede eliminar el producto porque tiene movimientos de stock asociados.',
      );
    }
    if (reasons.includes('ordenes')) {
      throw new BadRequestException(
        'No se puede eliminar el producto porque está vinculado a órdenes existentes.',
      );
    }

    await this.productRepository.delete(id);
  }
}
