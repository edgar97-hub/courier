import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, EntityManager } from 'typeorm';
import { KardexEntity, KARDEX_MOVEMENT_TYPE } from '../entities/kardex.entity';

export interface PaginatedKardex {
  items: any[];
  total_count: number;
  page_number: number;
  page_size: number;
}

@Injectable()
export class KardexService {
  constructor(
    @InjectRepository(KardexEntity)
    private readonly kardexRepository: Repository<KardexEntity>,
  ) {}

  async create(
    entry: {
      movement_type: KARDEX_MOVEMENT_TYPE;
      quantity: number;
      stock_before: number;
      stock_after: number;
      observation?: string;
      responsible_user_id?: string;
      reference_id?: string;
      reference_type?: string;
      company_id?: string;
      product_id?: string;
      variation_id: string;
      warehouse_id?: string;
    },
    manager?: EntityManager,
  ): Promise<KardexEntity> {
    if (manager) {
      const kardex = manager.create(KardexEntity, entry);
      return manager.save(KardexEntity, kardex);
    }
    const kardex = this.kardexRepository.create(entry);
    return this.kardexRepository.save(kardex);
  }

  async findPaginated(options: {
    page_number: number;
    page_size: number;
    sort_field: string;
    sort_direction: 'ASC' | 'DESC';
    search_term: string;
    filter_company?: string;
    filter_company_id?: string;
    filter_product?: string;
    filter_sku?: string;
    filter_movement_type?: string;
    filter_date_from?: string;
    filter_date_to?: string;
    filter_responsible_user?: string;
    filter_observation?: string;
    filter_quantity_from?: number;
    filter_quantity_to?: number;
    filter_stock_after_from?: number;
    filter_stock_after_to?: number;
  }): Promise<PaginatedKardex> {
    const {
      page_number,
      page_size,
      sort_field,
      sort_direction,
      search_term,
      filter_company,
      filter_company_id,
      filter_product,
      filter_sku,
      filter_movement_type,
      filter_date_from,
      filter_date_to,
      filter_responsible_user,
      filter_observation,
      filter_quantity_from,
      filter_quantity_to,
      filter_stock_after_from,
      filter_stock_after_to,
    } = options;
    const skip = (page_number - 1) * page_size;

    const qb = this.kardexRepository
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.variation', 'variation')
      .leftJoinAndSelect('variation.product', 'product')
      .leftJoinAndSelect('k.company', 'company')
      .leftJoinAndSelect('k.warehouse', 'warehouse')
      .leftJoinAndSelect('k.responsibleUser', 'responsibleUser');

    if (search_term) {
      const term = `%${search_term}%`;
      const lower = search_term.toLowerCase();
      const matches = (word: string) => word.startsWith(lower);
      qb.andWhere(
        new Brackets((innerQb) => {
          innerQb
            .where('company.username ILIKE :search', { search: term })
            .orWhere('product.name ILIKE :search', { search: term })
            .orWhere('variation.sku ILIKE :search', { search: term })
            .orWhere('variation.color ILIKE :search', { search: term })
            .orWhere('variation.size ILIKE :search', { search: term })
            .orWhere('variation.model ILIKE :search', { search: term })
            .orWhere('k.observation ILIKE :search', { search: term })
            .orWhere('CAST(k.movement_type AS TEXT) ILIKE :search', {
              search: term,
            })
            .orWhere('CAST(k.quantity AS TEXT) ILIKE :search', { search: term })
            .orWhere('CAST(k.stock_after AS TEXT) ILIKE :search', {
              search: term,
            })
            .orWhere('responsibleUser.username ILIKE :search', { search: term });
          if (matches('ingreso')) {
            innerQb.orWhere(`k.movement_type = '${KARDEX_MOVEMENT_TYPE.INBOUND}'`);
          }
          if (matches('salida') || matches('pedido')) {
            innerQb.orWhere(
              `k.movement_type = '${KARDEX_MOVEMENT_TYPE.ORDER_OUT}'`,
            );
          }
          if (matches('ajuste') || matches('suma')) {
            innerQb.orWhere(
              `k.movement_type = '${KARDEX_MOVEMENT_TYPE.MANUAL_ADD}'`,
            );
          }
          if (matches('resta')) {
            innerQb.orWhere(
              `k.movement_type = '${KARDEX_MOVEMENT_TYPE.MANUAL_SUBTRACT}'`,
            );
          }
          if (matches('reversion') || matches('anulacion')) {
            innerQb.orWhere(
              `k.movement_type = '${KARDEX_MOVEMENT_TYPE.ANNUL_REVERSAL}'`,
            );
          }
        }),
      );
    }

    if (filter_company) {
      qb.andWhere('company.username ILIKE :filter_company', {
        filter_company: `%${filter_company}%`,
      });
    }
    if (filter_company_id) {
      qb.andWhere('company.id = :filter_company_id', {
        filter_company_id,
      });
    }
    if (filter_product) {
      qb.andWhere('product.name ILIKE :filter_product', {
        filter_product: `%${filter_product}%`,
      });
    }
    if (filter_sku) {
      qb.andWhere(
        new Brackets((innerQb) => {
          innerQb
            .where('variation.sku ILIKE :filter_sku', {
              filter_sku: `%${filter_sku}%`,
            })
            .orWhere('variation.color ILIKE :filter_sku', {
              filter_sku: `%${filter_sku}%`,
            })
            .orWhere('variation.size ILIKE :filter_sku', {
              filter_sku: `%${filter_sku}%`,
            })
            .orWhere('variation.model ILIKE :filter_sku', {
              filter_sku: `%${filter_sku}%`,
            });
        }),
      );
    }
    if (filter_movement_type) {
      qb.andWhere('k.movement_type = :filter_movement_type', {
        filter_movement_type,
      });
    }
    if (filter_date_from) {
      qb.andWhere("DATE(k.createdAt AT TIME ZONE 'America/Lima') >= DATE(:filter_date_from)", {
        filter_date_from,
      });
    }
    if (filter_date_to) {
      qb.andWhere("DATE(k.createdAt AT TIME ZONE 'America/Lima') <= DATE(:filter_date_to)", {
        filter_date_to,
      });
    }
    if (filter_responsible_user) {
      qb.andWhere('responsibleUser.username ILIKE :filter_responsible_user', {
        filter_responsible_user: `%${filter_responsible_user}%`,
      });
    }
    if (filter_observation) {
      qb.andWhere('k.observation ILIKE :filter_observation', {
        filter_observation: `%${filter_observation}%`,
      });
    }
    if (filter_quantity_from !== undefined && filter_quantity_from !== null) {
      qb.andWhere('k.quantity >= :filter_quantity_from', {
        filter_quantity_from,
      });
    }
    if (filter_quantity_to !== undefined && filter_quantity_to !== null) {
      qb.andWhere('k.quantity <= :filter_quantity_to', {
        filter_quantity_to,
      });
    }
    if (filter_stock_after_from !== undefined && filter_stock_after_from !== null) {
      qb.andWhere('k.stock_after >= :filter_stock_after_from', {
        filter_stock_after_from,
      });
    }
    if (filter_stock_after_to !== undefined && filter_stock_after_to !== null) {
      qb.andWhere('k.stock_after <= :filter_stock_after_to', {
        filter_stock_after_to,
      });
    }

    // Sort field mapping
    const sortFieldMap: Record<string, string> = {
      createdAt: 'k.createdAt',
      company: 'company.username',
      product: 'product.name',
      sku: 'variation.sku',
      movement_type: 'k.movement_type',
      quantity: 'k.quantity',
      stock_before: 'k.stock_before',
      stock_after: 'k.stock_after',
      responsible_user: 'responsibleUser.username',
      observation: 'k.observation',
    };
    const sortBy = sortFieldMap[sort_field] || `k.${sort_field}`;

    qb.orderBy(sortBy, sort_direction).skip(skip).take(page_size);

    const [items, total_count] = await qb.getManyAndCount();

    const mappedItems = items.map((k) => ({
      id: k.id,
      createdAt: k.createdAt,
      movement_type: k.movement_type,
      quantity: k.quantity,
      stock_before: k.stock_before,
      stock_after: k.stock_after,
      observation: k.observation,
      responsible_user: k.responsibleUser?.username || 'Sistema',
      responsible_user_id: k.responsible_user_id,
      reference_id: k.reference_id,
      reference_type: k.reference_type,
      variation: k.variation
        ? {
            id: k.variation.id,
            sku: k.variation.sku,
            color: k.variation.color,
            size: k.variation.size,
            model: k.variation.model,
            code: k.variation.code,
            product_id: k.variation.product_id,
          }
        : null,
      product: k.variation?.product
        ? {
            id: k.variation.product.id,
            name: k.variation.product.name,
            code: k.variation.product.code,
          }
        : null,
      company: k.company
        ? {
            id: k.company.id,
            username: k.company.username,
            code: k.company.code,
          }
        : null,
      warehouse: k.warehouse
        ? {
            id: k.warehouse.id,
            name: k.warehouse.name,
            code: k.warehouse.code,
          }
        : null,
    }));

    return {
      items: mappedItems,
      total_count,
      page_number,
      page_size,
    };
  }
}
