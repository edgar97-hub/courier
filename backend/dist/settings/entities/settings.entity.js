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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
let SettingsEntity = class SettingsEntity extends base_entity_1.BaseEntity {
};
exports.SettingsEntity = SettingsEntity;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SettingsEntity.prototype, "business_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SettingsEntity.prototype, "ruc", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SettingsEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SettingsEntity.prototype, "phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SettingsEntity.prototype, "logo_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SettingsEntity.prototype, "terms_conditions_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SettingsEntity.prototype, "background_image_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SettingsEntity.prototype, "rates_image_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SettingsEntity.prototype, "excel_import_template_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SettingsEntity.prototype, "coverage_map_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], SettingsEntity.prototype, "global_notice_image_url", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        default: () => "'[]'",
    }),
    __metadata("design:type", Array)
], SettingsEntity.prototype, "promotional_sets", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], SettingsEntity.prototype, "standard_measurements_width", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], SettingsEntity.prototype, "standard_measurements_height", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], SettingsEntity.prototype, "standard_measurements_length", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], SettingsEntity.prototype, "standard_measurements_weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], SettingsEntity.prototype, "maximum_measurements_width", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], SettingsEntity.prototype, "maximum_measurements_height", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], SettingsEntity.prototype, "maximum_measurements_length", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], SettingsEntity.prototype, "maximum_measurements_weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], SettingsEntity.prototype, "volumetric_factor", void 0);
exports.SettingsEntity = SettingsEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'settings' })
], SettingsEntity);
//# sourceMappingURL=settings.entity.js.map