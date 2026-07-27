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
exports.KardexService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const kardex_entity_1 = require("../entities/kardex.entity");
let KardexService = class KardexService {
    constructor(kardexRepository) {
        this.kardexRepository = kardexRepository;
    }
    async create(entry) {
        const kardex = this.kardexRepository.create(entry);
        return this.kardexRepository.save(kardex);
    }
    async findPaginated(options) {
        const { page_number, page_size, sort_field, sort_direction, search_term, filter_company, filter_company_id, filter_product, filter_sku, filter_movement_type, filter_date_from, filter_date_to, filter_responsible_user, filter_observation, filter_quantity_from, filter_quantity_to, filter_stock_after_from, filter_stock_after_to, } = options;
        const skip = (page_number - 1) * page_size;
        const qb = this.kardexRepository
            .createQueryBuilder('k')
            .leftJoinAndSelect('k.variation', 'variation')
            .leftJoinAndSelect('variation.product', 'product')
            .leftJoinAndSelect('k.company', 'company')
            .leftJoinAndSelect('k.warehouse', 'warehouse')
            .leftJoinAndSelect('k.responsibleUser', 'responsibleUser');
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
                    .orWhere('k.observation ILIKE :search', {
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
        if (filter_sku) {
            qb.andWhere(new typeorm_2.Brackets((innerQb) => {
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
            }));
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
        const sortFieldMap = {
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
};
exports.KardexService = KardexService;
exports.KardexService = KardexService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(kardex_entity_1.KardexEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], KardexService);
//# sourceMappingURL=kardex.service.js.map