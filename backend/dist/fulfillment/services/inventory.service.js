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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_entity_1 = require("../entities/inventory.entity");
let InventoryService = class InventoryService {
    constructor(inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }
    async queryInventory(options) {
        const { page_number, page_size, sort_field, sort_direction, search_term, filter_company, filter_company_id, filter_product, filter_product_id, filter_variation_id, filter_sku, filter_color, filter_size, filter_model, filter_stock_from, filter_stock_to, filter_min_stock_from, filter_min_stock_to, } = options;
        const skip = (page_number - 1) * page_size;
        const qb = this.inventoryRepository
            .createQueryBuilder('inv')
            .leftJoinAndSelect('inv.variation', 'variation')
            .leftJoinAndSelect('variation.product', 'product')
            .leftJoinAndSelect('product.company', 'company')
            .leftJoinAndSelect('inv.warehouse', 'warehouse');
        if (search_term) {
            qb.andWhere(new typeorm_2.Brackets((innerQb) => {
                innerQb
                    .where('company.username ILIKE :search', {
                    search: `%${search_term}%`,
                })
                    .orWhere('product.name ILIKE :search', {
                    search: `%${search_term}%`,
                })
                    .orWhere('variation.sku ILIKE :search', {
                    search: `%${search_term}%`,
                })
                    .orWhere('variation.color ILIKE :search', {
                    search: `%${search_term}%`,
                })
                    .orWhere('variation.size ILIKE :search', {
                    search: `%${search_term}%`,
                })
                    .orWhere('variation.model ILIKE :search', {
                    search: `%${search_term}%`,
                });
            }));
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
        const sortFieldMap = {
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_entity_1.InventoryEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map