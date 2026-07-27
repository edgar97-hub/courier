import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariationDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  length_cm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  width_cm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  height_cm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight_kg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_stock?: number;
}

export class CreateFulfillmentProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUUID()
  company_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariationDto)
  variations: CreateVariationDto[];
}
