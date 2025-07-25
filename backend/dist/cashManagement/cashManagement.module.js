"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashManagementModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cashManagement_entity_1 = require("./entities/cashManagement.entity");
const cashManagement_service_1 = require("./services/cashManagement.service");
const cashManagement_controller_1 = require("./controllers/cashManagement.controller");
const users_module_1 = require("../users/users.module");
const cash_movement_pdf_generator_service_1 = require("./services/cash-movement-pdf-generator.service");
const settings_entity_1 = require("../settings/entities/settings.entity");
let CashManagementModule = class CashManagementModule {
};
exports.CashManagementModule = CashManagementModule;
exports.CashManagementModule = CashManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([cashManagement_entity_1.CashManagementEntity, settings_entity_1.SettingsEntity]),
            users_module_1.UsersModule
        ],
        providers: [cashManagement_service_1.CashManagementService, cash_movement_pdf_generator_service_1.CashMovementPdfGeneratorService],
        controllers: [cashManagement_controller_1.CashManagementController],
        exports: [cashManagement_service_1.CashManagementService],
    })
], CashManagementModule);
//# sourceMappingURL=cashManagement.module.js.map