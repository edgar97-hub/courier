import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ADJUSTMENT_TYPE } from '../entities/stock-adjustment.entity';

export class CreateStockAdjustmentDto {
  @IsNotEmpty()
  @IsEnum(ADJUSTMENT_TYPE)
  adjustment_type: ADJUSTMENT_TYPE;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsString()
  observation: string;

  @IsNotEmpty()
  @IsUUID()
  company_id: string;

  @IsNotEmpty()
  @IsUUID()
  product_id: string;

  @IsNotEmpty()
  @IsUUID()
  variation_id: string;

  @IsNotEmpty()
  @IsUUID()
  warehouse_id: string;

  @IsOptional()
  @IsString()
  responsible_user?: string;
}
