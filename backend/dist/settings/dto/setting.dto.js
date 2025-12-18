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
exports.SettingUpdateDTO = exports.SettingDTO = exports.PromotionalSetItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const class_validator_2 = require("class-validator");
class PromotionalSetItemDto {
}
exports.PromotionalSetItemDto = PromotionalSetItemDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PromotionalSetItemDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1024),
    __metadata("design:type", Object)
], PromotionalSetItemDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1024),
    __metadata("design:type", Object)
], PromotionalSetItemDto.prototype, "linkUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", Object)
], PromotionalSetItemDto.prototype, "buttonText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PromotionalSetItemDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PromotionalSetItemDto.prototype, "order", void 0);
class SettingDTO {
}
exports.SettingDTO = SettingDTO;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingDTO.prototype, "business_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingDTO.prototype, "ruc", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingDTO.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingDTO.prototype, "phone_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingDTO.prototype, "logo_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingDTO.prototype, "terms_conditions_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingDTO.prototype, "background_image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingDTO.prototype, "rates_image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingDTO.prototype, "excel_import_template_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingDTO.prototype, "coverage_map_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingDTO.prototype, "standard_measurements_width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingDTO.prototype, "standard_measurements_length", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingDTO.prototype, "standard_measurements_height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingDTO.prototype, "standard_measurements_weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingDTO.prototype, "maximum_measurements_width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingDTO.prototype, "maximum_measurements_length", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingDTO.prototype, "maximum_measurements_height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingDTO.prototype, "maximum_measurements_weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingDTO.prototype, "volumetric_factor", void 0);
class SettingUpdateDTO {
}
exports.SettingUpdateDTO = SettingUpdateDTO;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingUpdateDTO.prototype, "business_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingUpdateDTO.prototype, "ruc", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingUpdateDTO.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingUpdateDTO.prototype, "phone_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingUpdateDTO.prototype, "logo_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingUpdateDTO.prototype, "background_image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingUpdateDTO.prototype, "rates_image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingUpdateDTO.prototype, "excel_import_template_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingUpdateDTO.prototype, "coverage_map_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingUpdateDTO.prototype, "global_notice_image_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMaxSize)(3, {
        message: 'Se permite un máximo de 3 conjuntos promocionales.',
    }),
    (0, class_transformer_1.Type)(() => PromotionalSetItemDto),
    __metadata("design:type", Array)
], SettingUpdateDTO.prototype, "promotional_sets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingUpdateDTO.prototype, "standard_measurements_width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingUpdateDTO.prototype, "standard_measurements_length", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingUpdateDTO.prototype, "standard_measurements_height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingUpdateDTO.prototype, "standard_measurements_weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingUpdateDTO.prototype, "maximum_measurements_width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingUpdateDTO.prototype, "maximum_measurements_length", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingUpdateDTO.prototype, "maximum_measurements_height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingUpdateDTO.prototype, "maximum_measurements_weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettingUpdateDTO.prototype, "volumetric_factor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SettingUpdateDTO.prototype, "googleMapsApiKey", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SettingUpdateDTO.prototype, "multiPackageDiscountPercentage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_2.IsDateString)(),
    __metadata("design:type", Object)
], SettingUpdateDTO.prototype, "multiPackageDiscountStartDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_2.IsDateString)(),
    __metadata("design:type", Object)
], SettingUpdateDTO.prototype, "multiPackageDiscountEndDate", void 0);
//# sourceMappingURL=setting.dto.js.map