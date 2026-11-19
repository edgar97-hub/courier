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
exports.FulfillmentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const typeorm_3 = require("typeorm");
const fulfillment_product_entity_1 = require("./entities/fulfillment-product.entity");
const product_variation_entity_1 = require("./entities/product-variation.entity");
const warehouse_entity_1 = require("./entities/warehouse.entity");
const inventory_entity_1 = require("./entities/inventory.entity");
const stock_adjustment_entity_1 = require("./entities/stock-adjustment.entity");
const kardex_entity_1 = require("./entities/kardex.entity");
const products_service_1 = require("./services/products.service");
const stock_adjustment_service_1 = require("./services/stock-adjustment.service");
const kardex_service_1 = require("./services/kardex.service");
const inventory_service_1 = require("./services/inventory.service");
const products_controller_1 = require("./controllers/products.controller");
const stock_adjustment_controller_1 = require("./controllers/stock-adjustment.controller");
const kardex_controller_1 = require("./controllers/kardex.controller");
const inventory_controller_1 = require("./controllers/inventory.controller");
let FulfillmentModule = class FulfillmentModule {
    constructor(warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }
    async onModuleInit() {
        const existing = await this.warehouseRepository.findOne({
            where: { code: 'MAIN' },
        });
        if (!existing) {
            const mainWarehouse = this.warehouseRepository.create({
                name: 'Almacén Principal',
                code: 'MAIN',
                is_main: true,
            });
            await this.warehouseRepository.save(mainWarehouse);
            console.log('✅ Default warehouse "Almacén Principal" seeded.');
        }
    }
};
exports.FulfillmentModule = FulfillmentModule;
exports.FulfillmentModule = FulfillmentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                fulfillment_product_entity_1.FulfillmentProductEntity,
                product_variation_entity_1.ProductVariationEntity,
                warehouse_entity_1.WarehouseEntity,
                inventory_entity_1.InventoryEntity,
                stock_adjustment_entity_1.StockAdjustmentEntity,
                kardex_entity_1.KardexEntity,
            ]),
        ],
        providers: [products_service_1.FulfillmentService, stock_adjustment_service_1.StockAdjustmentService, kardex_service_1.KardexService, inventory_service_1.InventoryService],
        controllers: [products_controller_1.ProductsController, stock_adjustment_controller_1.StockAdjustmentController, kardex_controller_1.KardexController, inventory_controller_1.InventoryController],
        exports: [products_service_1.FulfillmentService, stock_adjustment_service_1.StockAdjustmentService, kardex_service_1.KardexService, inventory_service_1.InventoryService, typeorm_1.TypeOrmModule],
    }),
    __param(0, (0, typeorm_2.InjectRepository)(warehouse_entity_1.WarehouseEntity)),
    __metadata("design:paramtypes", [typeorm_3.Repository])
], FulfillmentModule);
//# sourceMappingURL=fulfillment.module.js.map