"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributorRecordsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const distributor_records_controller_1 = require("./controllers/distributor-records.controller");
const distributor_records_service_1 = require("./services/distributor-records.service");
const distributor_record_entity_1 = require("./entities/distributor-record.entity");
const users_module_1 = require("../users/users.module");
const users_entity_1 = require("../users/entities/users.entity");
const pdf_generator_service_1 = require("./services/pdf-generator.service");
let DistributorRecordsModule = class DistributorRecordsModule {
};
exports.DistributorRecordsModule = DistributorRecordsModule;
exports.DistributorRecordsModule = DistributorRecordsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([distributor_record_entity_1.DistributorRecordEntity, users_entity_1.UsersEntity]),
            users_module_1.UsersModule,
        ],
        controllers: [distributor_records_controller_1.DistributorRecordsController],
        providers: [distributor_records_service_1.DistributorRecordsService, pdf_generator_service_1.PdfGeneratorService],
        exports: [distributor_records_service_1.DistributorRecordsService],
    })
], DistributorRecordsModule);
//# sourceMappingURL=distributor-records.module.js.map