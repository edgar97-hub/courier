import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TYPES_MOVEMENTS } from '../entities/cashManagement.entity';

export class CreateCashMovementDto {
  @ApiProperty({ example: '2025-07-21', description: 'Fecha del movimiento (YYYY-MM-DD)' }) // Changed example and description
  @IsOptional() // Date is now optional as per entity
  @IsDateString()
  date?: string; // Changed to optional string

  @ApiProperty({ example: 100.50, description: 'Monto del movimiento' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: TYPES_MOVEMENTS.INCOME, enum: TYPES_MOVEMENTS, description: 'Tipo de movimiento (INGRESO/EGRESO)' })
  @IsEnum(TYPES_MOVEMENTS)
  typeMovement: TYPES_MOVEMENTS;

  @ApiProperty({ example: 'Efectivo', description: 'Forma de pago', required: false })
  @IsOptional()
  @IsString()
  paymentsMethod?: string;

  @ApiProperty({ example: 'Venta de productos', description: 'Descripción o motivo del movimiento', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'ID del usuario que realizó la operación', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class QueryCashMovementDto {
  @ApiProperty({ example: '2025-07-01', description: 'Fecha de inicio para el filtro', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2025-07-31', description: 'Fecha de fin para el filtro', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: TYPES_MOVEMENTS.INCOME, enum: TYPES_MOVEMENTS, description: 'Filtrar por tipo de movimiento', required: false })
  @IsOptional()
  @IsEnum(TYPES_MOVEMENTS)
  typeMovement?: TYPES_MOVEMENTS;

  @ApiProperty({ example: 'Efectivo', description: 'Filtrar por forma de pago', required: false })
  @IsOptional()
  @IsString()
  paymentsMethod?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'Filtrar por ID de usuario', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: 'date', description: 'Campo por el cual ordenar (e.g., date, amount, code)', required: false })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiProperty({ example: 'DESC', description: 'Dirección del ordenamiento (ASC o DESC)', required: false })
  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC', 'asc', 'desc'])
  orderDirection?: 'ASC' | 'DESC' | 'asc' | 'desc';

  @ApiProperty({ example: 'description', description: 'Campo de búsqueda general', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PaymentMethodSummary {
  @ApiProperty({ example: 100.50, description: 'Total de ingresos para esta forma de pago' })
  income: number;

  @ApiProperty({ example: 50.25, description: 'Total de egresos para esta forma de pago' })
  expense: number;

  @ApiProperty({ example: 50.25, description: 'Saldo para esta forma de pago' })
  balance: number;
}

export class DetailedCashMovementSummaryDto {
  @ApiProperty({ type: PaymentMethodSummary, description: 'Resumen para Efectivo' })
  Efectivo: PaymentMethodSummary;

  @ApiProperty({ type: PaymentMethodSummary, description: 'Resumen para Yape/Transferencia BCP' })
  'Yape/Transferencia BCP': PaymentMethodSummary;

  @ApiProperty({ type: PaymentMethodSummary, description: 'Resumen para Plin/Transferencia INTERBANK' })
  'Plin/Transferencia INTERBANK': PaymentMethodSummary;

  @ApiProperty({ type: PaymentMethodSummary, description: 'Resumen para POS' })
  POS: PaymentMethodSummary;

  @ApiProperty({ example: 500.00, description: 'Total de ingresos en caja (suma de todos los ingresos)' })
  totalCashIncome: number;

  @ApiProperty({ example: 200.00, description: 'Total de egresos en caja (suma de todos los egresos)' })
  totalCashExpense: number;

  @ApiProperty({ example: 300.00, description: 'Saldo total en caja (ingresos - egresos)' })
  totalCashBalance: number;
}
