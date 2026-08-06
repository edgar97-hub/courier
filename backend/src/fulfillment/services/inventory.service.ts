import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { InventoryEntity } from '../entities/inventory.entity';

export interface PaginatedInventoryQuery {
  items: any[];
  total_count: number;
  page_number: number;
  page_size: number;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
  ) {}

  async queryInventory(options: {
    page_number: number;
    page_size: number;
    sort_field: string;
    sort_direction: 'ASC' | 'DESC';
    search_term: string;

    filter_company?: string;
    filter_company_id?: string;
    filter_product?: string;
    filter_product_id?: string;
    filter_variation_id?: string;
    filter_sku?: string;
    filter_color?: string;
    filter_size?: string;
    filter_model?: string;
    filter_stock_from?: number;
    filter_stock_to?: number;
    filter_min_stock_from?: number;
    filter_min_stock_to?: number;
  }): Promise<PaginatedInventoryQuery> {
    const {
      page_number,
      page_size,
      sort_field,
      sort_direction,
      search_term,

      filter_company,
      filter_company_id,
      filter_product,
      filter_product_id,
      filter_variation_id,
      filter_sku,
      filter_color,
      filter_size,
      filter_model,
      filter_stock_from,
      filter_stock_to,
      filter_min_stock_from,
      filter_min_stock_to,
    } = options;
    const skip = (page_number - 1) * page_size;

    const qb = this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.variation', 'variation')
      .leftJoinAndSelect('variation.product', 'product')
      .leftJoinAndSelect('product.company', 'company')
      .leftJoinAndSelect('inv.warehouse', 'warehouse');

    if (search_term) {
      const term = `%${search_term}%`;
      const lower = search_term.toLowerCase();
      const matches = (word: string) => word.startsWith(lower);
      qb.andWhere(
        new Brackets((innerQb) => {
          innerQb
            .where('company.username ILIKE :search', {
              search: term,
            })
            .orWhere('product.name ILIKE :search', {
              search: term,
            })
            .orWhere('variation.sku ILIKE :search', {
              search: term,
            })
            .orWhere('variation.color ILIKE :search', {
              search: term,
            })
            .orWhere('variation.size ILIKE :search', {
              search: term,
            })
            .orWhere('variation.model ILIKE :search', {
              search: term,
            })
            .orWhere('CAST(inv.stock AS TEXT) ILIKE :search', {
              search: term,
            })
            .orWhere('CAST(variation.min_stock AS TEXT) ILIKE :search', {
              search: term,
            });
          if (matches('bajo')) {
            innerQb.orWhere('inv.stock <= variation.min_stock');
          }
          if (matches('normal')) {
            innerQb.orWhere('inv.stock > variation.min_stock');
          }
        }),
      );
    }

    // Per-column filters
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
    if (filter_product_id) {
      qb.andWhere('product.id = :filter_product_id', {
        filter_product_id,
      });
    }
    if (filter_variation_id) {
      qb.andWhere('variation.id = :filter_variation_id', {
        filter_variation_id,
      });
    }
    if (filter_sku) {
      qb.andWhere('variation.sku ILIKE :filter_sku', {
        filter_sku: `%${filter_sku}%`,
      });
    }
    if (filter_color) {
      qb.andWhere('variation.color ILIKE :filter_color', {
        filter_color: `%${filter_color}%`,
      });
    }
    if (filter_size) {
      qb.andWhere('variation.size ILIKE :filter_size', {
        filter_size: `%${filter_size}%`,
      });
    }
    if (filter_model) {
      qb.andWhere('variation.model ILIKE :filter_model', {
        filter_model: `%${filter_model}%`,
      });
    }
    if (filter_stock_from !== undefined) {
      qb.andWhere('inv.stock >= :filter_stock_from', {
        filter_stock_from,
      });
    }
    if (filter_stock_to !== undefined) {
      qb.andWhere('inv.stock <= :filter_stock_to', {
        filter_stock_to,
      });
    }

    if (filter_min_stock_from !== undefined) {
      qb.andWhere('variation.min_stock >= :filter_min_stock_from', {
        filter_min_stock_from,
      });
    }
    if (filter_min_stock_to !== undefined) {
      qb.andWhere('variation.min_stock <= :filter_min_stock_to', {
        filter_min_stock_to,
      });
    }

    // Sort field mapping
    const sortFieldMap: Record<string, string> = {
      company: 'company.username',
      product: 'product.name',
      sku: 'variation.sku',
      color: 'variation.color',
      size: 'variation.size',
      model: 'variation.model',
      stock: 'inv.stock',
      min_stock: 'variation.min_stock',
      createdAt: 'inv.createdAt',
    };
    const sortBy = sortFieldMap[sort_field] || `inv.${sort_field}`;

    qb.orderBy(sortBy, sort_direction).skip(skip).take(page_size);

    const [items, total_count] = await qb.getManyAndCount();

    // Map to a flat structure for the frontend
    const mappedItems = items.map((inv) => ({
      id: inv.id,
      stock: inv.stock,
      warehouse_id: inv.warehouse_id,
      warehouse: inv.warehouse
        ? {
            id: inv.warehouse.id,
            name: inv.warehouse.name,
            code: inv.warehouse.code,
          }
        : null,
      variation: inv.variation
        ? {
            id: inv.variation.id,
            sku: inv.variation.sku,
            color: inv.variation.color,
            size: inv.variation.size,
            model: inv.variation.model,
            length_cm: inv.variation.length_cm,
            width_cm: inv.variation.width_cm,
            height_cm: inv.variation.height_cm,
            weight_kg: inv.variation.weight_kg,
            min_stock: inv.variation.min_stock,
            code: inv.variation.code,
            product_id: inv.variation.product_id,
          }
        : null,
      product: inv.variation?.product
        ? {
            id: inv.variation.product.id,
            name: inv.variation.product.name,
            code: inv.variation.product.code,
          }
        : null,
      company: inv.variation?.product?.company
        ? {
            id: inv.variation.product.company.id,
            username: inv.variation.product.company.username,
            code: inv.variation.product.company.code,
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
