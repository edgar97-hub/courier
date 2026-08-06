import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, QueryRunner, EntityManager } from 'typeorm';
import {
  StockAdjustmentEntity,
  ADJUSTMENT_TYPE,
  ADJUSTMENT_STATUS,
} from '../entities/stock-adjustment.entity';
import { InventoryEntity } from '../entities/inventory.entity';
import { FulfillmentProductEntity } from '../entities/fulfillment-product.entity';
import { ProductVariationEntity } from '../entities/product-variation.entity';
import { WarehouseEntity } from '../entities/warehouse.entity';
import { CreateStockAdjustmentDto } from '../dto/create-stock-adjustment.dto';
import { KardexService } from './kardex.service';
import { KARDEX_MOVEMENT_TYPE } from '../entities/kardex.entity';

@Injectable()
export class StockAdjustmentService {
  constructor(
    @InjectRepository(StockAdjustmentEntity)
    private readonly adjustmentRepository: Repository<StockAdjustmentEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(FulfillmentProductEntity)
    private readonly productRepository: Repository<FulfillmentProductEntity>,
    @InjectRepository(ProductVariationEntity)
    private readonly variationRepository: Repository<ProductVariationEntity>,
    @InjectRepository(WarehouseEntity)
    private readonly warehouseRepository: Repository<WarehouseEntity>,
    private readonly kardexService: KardexService,
  ) {}

  async create(
    dto: CreateStockAdjustmentDto,
    userId?: string,
    manager?: EntityManager,
  ): Promise<StockAdjustmentEntity> {
    if (manager) {
      return this.createWithManager(dto, userId, manager);
    }

    const queryRunner: QueryRunner =
      this.inventoryRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const saved = await this.createWithManager(
        dto,
        userId,
        queryRunner.manager,
      );
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createWithManager(
    dto: CreateStockAdjustmentDto,
    userId: string | undefined,
    manager: EntityManager,
  ): Promise<StockAdjustmentEntity> {
    // Find or create inventory record for this variation + warehouse
    let inventory = await manager.findOne(InventoryEntity, {
      where: {
        variation_id: dto.variation_id,
        warehouse_id: dto.warehouse_id,
      },
    });

    if (!inventory) {
      inventory = manager.create(InventoryEntity, {
        variation_id: dto.variation_id,
        warehouse_id: dto.warehouse_id,
        stock: 0,
      });
      await manager.save(InventoryEntity, inventory);
    }

    const stockBefore = inventory.stock;
    let stockAfter = stockBefore;

    switch (dto.adjustment_type) {
      case ADJUSTMENT_TYPE.INBOUND:
      case ADJUSTMENT_TYPE.MANUAL_ADD:
        stockAfter = stockBefore + dto.quantity;
        break;
      case ADJUSTMENT_TYPE.MANUAL_SUBTRACT:
        if (stockBefore < dto.quantity) {
          throw new BadRequestException(
            `Stock insuficiente. Stock actual: ${stockBefore}, cantidad a restar: ${dto.quantity}`,
          );
        }
        stockAfter = stockBefore - dto.quantity;
        break;
    }

    await manager.update(InventoryEntity, inventory.id, {
      stock: stockAfter,
    });

    const adjustment = manager.create(StockAdjustmentEntity, {
      adjustment_type: dto.adjustment_type,
      quantity: dto.quantity,
      observation: dto.observation,
      company_id: dto.company_id,
      product_id: dto.product_id,
      variation_id: dto.variation_id,
      warehouse_id: dto.warehouse_id,
      status: ADJUSTMENT_STATUS.REGISTERED,
    });

    const saved = await manager.save(StockAdjustmentEntity, adjustment);

    // Create kardex entry
    const movementTypeMap: Record<string, KARDEX_MOVEMENT_TYPE> = {
      [ADJUSTMENT_TYPE.INBOUND]: KARDEX_MOVEMENT_TYPE.INBOUND,
      [ADJUSTMENT_TYPE.MANUAL_ADD]: KARDEX_MOVEMENT_TYPE.MANUAL_ADD,
      [ADJUSTMENT_TYPE.MANUAL_SUBTRACT]: KARDEX_MOVEMENT_TYPE.MANUAL_SUBTRACT,
    };

    await this.kardexService.create(
      {
        movement_type:
          movementTypeMap[dto.adjustment_type] ||
          KARDEX_MOVEMENT_TYPE.MANUAL_ADD,
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
      },
      manager,
    );

    return saved;
  }

  async findPaginated(options: {
    page_number: number;
    page_size: number;
    sort_field: string;
    sort_direction: 'ASC' | 'DESC';
    search_term: string;
  }): Promise<{
    items: StockAdjustmentEntity[];
    total_count: number;
    page_number: number;
    page_size: number;
  }> {
    const { page_number, page_size, sort_field, sort_direction, search_term } =
      options;
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
      const matches = (word: string) => word.startsWith(lower);
      queryBuilder.andWhere(
        new Brackets((qb) => {
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
            qb.orWhere(`a.adjustment_type = '${ADJUSTMENT_TYPE.INBOUND}'`);
          }
          if (matches('ajuste')) {
            qb.orWhere(
              `a.adjustment_type IN ('${ADJUSTMENT_TYPE.MANUAL_ADD}', '${ADJUSTMENT_TYPE.MANUAL_SUBTRACT}')`,
            );
          }
          if (matches('suma')) {
            qb.orWhere(`a.adjustment_type = '${ADJUSTMENT_TYPE.MANUAL_ADD}'`);
          }
          if (matches('resta')) {
            qb.orWhere(
              `a.adjustment_type = '${ADJUSTMENT_TYPE.MANUAL_SUBTRACT}'`,
            );
          }
          if (matches('registrado')) {
            qb.orWhere(`a.status = '${ADJUSTMENT_STATUS.REGISTERED}'`);
          }
          if (matches('anulado')) {
            qb.orWhere(`a.status = '${ADJUSTMENT_STATUS.ANNULLED}'`);
          }
        }),
      );
    }

    const sortFieldMap: Record<string, string> = {
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

  async getProductsByCompany(
    companyId: string,
  ): Promise<FulfillmentProductEntity[]> {
    return this.productRepository.find({
      where: { company_id: companyId },
      order: { name: 'ASC' },
    });
  }

  async getVariationsByProduct(
    productId: string,
  ): Promise<ProductVariationEntity[]> {
    return this.variationRepository.find({
      where: { product_id: productId },
      order: { sku: 'ASC' },
    });
  }

  async getMainWarehouse(): Promise<WarehouseEntity> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { is_main: true },
    });
    if (!warehouse) {
      throw new NotFoundException(
        'No se encontró un almacén principal. Contacte al administrador.',
      );
    }
    return warehouse;
  }

  async annul(id: string, userId?: string): Promise<StockAdjustmentEntity> {
    const queryRunner: QueryRunner =
      this.adjustmentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const adjustment = await queryRunner.manager.findOne(
        StockAdjustmentEntity,
        {
          where: { id },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!adjustment) {
        throw new BadRequestException('Ajuste de stock no encontrado');
      }

      if (adjustment.status === ADJUSTMENT_STATUS.ANNULLED) {
        throw new BadRequestException('Este ajuste ya está anulado');
      }

      // Reverse the stock change
      const inventory = await queryRunner.manager.findOne(InventoryEntity, {
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
          case ADJUSTMENT_TYPE.INBOUND:
          case ADJUSTMENT_TYPE.MANUAL_ADD:
            stockAfter = inventory.stock - adjustment.quantity;
            break;
          case ADJUSTMENT_TYPE.MANUAL_SUBTRACT:
            stockAfter = inventory.stock + adjustment.quantity;
            break;
        }

        if (stockAfter < 0) {
          throw new BadRequestException(
            'No se puede anular: el stock actual no permite la reversión (resultaría en stock negativo)',
          );
        }

        await queryRunner.manager.update(InventoryEntity, inventory.id, {
          stock: stockAfter,
        });
      }

      adjustment.status = ADJUSTMENT_STATUS.ANNULLED;
      const saved = await queryRunner.manager.save(
        StockAdjustmentEntity,
        adjustment,
      );

      // Create kardex entry for the annulment reversal
      await this.kardexService.create(
        {
          movement_type: KARDEX_MOVEMENT_TYPE.ANNUL_REVERSAL,
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
        },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
