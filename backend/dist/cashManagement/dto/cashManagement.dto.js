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
exports.DetailedCashMovementSummaryDto = exports.PaymentMethodSummary = exports.QueryCashMovementDto = exports.CreateCashMovementDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const cashManagement_entity_1 = require("../entities/cashManagement.entity");
class CreateCashMovementDto {
}
exports.CreateCashMovementDto = CreateCashMovementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-07-21', description: 'Fecha del movimiento (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCashMovementDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.50, description: 'Monto del movimiento' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCashMovementDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: cashManagement_entity_1.TYPES_MOVEMENTS.INCOME, enum: cashManagement_entity_1.TYPES_MOVEMENTS, description: 'Tipo de movimiento (INGRESO/EGRESO)' }),
    (0, class_validator_1.IsEnum)(cashManagement_entity_1.TYPES_MOVEMENTS),
    __metadata("design:type", String)
], CreateCashMovementDto.prototype, "typeMovement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Efectivo', description: 'Forma de pago', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashMovementDto.prototype, "paymentsMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Venta de productos', description: 'Descripción o motivo del movimiento', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashMovementDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'ID del usuario que realizó la operación', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCashMovementDto.prototype, "userId", void 0);
class QueryCashMovementDto {
}
exports.QueryCashMovementDto = QueryCashMovementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-07-01', description: 'Fecha de inicio para el filtro', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryCashMovementDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-07-31', description: 'Fecha de fin para el filtro', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryCashMovementDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: cashManagement_entity_1.TYPES_MOVEMENTS.INCOME, enum: cashManagement_entity_1.TYPES_MOVEMENTS, description: 'Filtrar por tipo de movimiento', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(cashManagement_entity_1.TYPES_MOVEMENTS),
    __metadata("design:type", String)
], QueryCashMovementDto.prototype, "typeMovement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Efectivo', description: 'Filtrar por forma de pago', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCashMovementDto.prototype, "paymentsMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'Filtrar por ID de usuario', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryCashMovementDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'date', description: 'Campo por el cual ordenar (e.g., date, amount, code)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCashMovementDto.prototype, "orderBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'DESC', description: 'Dirección del ordenamiento (ASC o DESC)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['ASC', 'DESC', 'asc', 'desc']),
    __metadata("design:type", String)
], QueryCashMovementDto.prototype, "orderDirection", void 0);
class PaymentMethodSummary {
}
exports.PaymentMethodSummary = PaymentMethodSummary;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.50, description: 'Total de ingresos para esta forma de pago' }),
    __metadata("design:type", Number)
], PaymentMethodSummary.prototype, "income", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50.25, description: 'Total de egresos para esta forma de pago' }),
    __metadata("design:type", Number)
], PaymentMethodSummary.prototype, "expense", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50.25, description: 'Saldo para esta forma de pago' }),
    __metadata("design:type", Number)
], PaymentMethodSummary.prototype, "balance", void 0);
class DetailedCashMovementSummaryDto {
}
exports.DetailedCashMovementSummaryDto = DetailedCashMovementSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaymentMethodSummary, description: 'Resumen para Efectivo' }),
    __metadata("design:type", PaymentMethodSummary)
], DetailedCashMovementSummaryDto.prototype, "Efectivo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaymentMethodSummary, description: 'Resumen para Yape/Transferencia BCP' }),
    __metadata("design:type", PaymentMethodSummary)
], DetailedCashMovementSummaryDto.prototype, "Yape/Transferencia BCP", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaymentMethodSummary, description: 'Resumen para Plin/Transferencia INTERBANK' }),
    __metadata("design:type", PaymentMethodSummary)
], DetailedCashMovementSummaryDto.prototype, "Plin/Transferencia INTERBANK", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaymentMethodSummary, description: 'Resumen para POS' }),
    __metadata("design:type", PaymentMethodSummary)
], DetailedCashMovementSummaryDto.prototype, "POS", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500.00, description: 'Total de ingresos en caja (suma de todos los ingresos)' }),
    __metadata("design:type", Number)
], DetailedCashMovementSummaryDto.prototype, "totalCashIncome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200.00, description: 'Total de egresos en caja (suma de todos los egresos)' }),
    __metadata("design:type", Number)
], DetailedCashMovementSummaryDto.prototype, "totalCashExpense", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 300.00, description: 'Saldo total en caja (ingresos - egresos)' }),
    __metadata("design:type", Number)
], DetailedCashMovementSummaryDto.prototype, "totalCashBalance", void 0);
//# sourceMappingURL=cashManagement.dto.js.map