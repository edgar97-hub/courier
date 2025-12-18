import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { STATES } from 'src/constants/roles';
import { PartialType } from '@nestjs/swagger';
import { PackageType } from '../entities/order-item.entity';
import { Type } from 'class-transformer';

export class OrderItemDTO {
  @ApiProperty({ enum: PackageType })
  @IsEnum(PackageType)
  package_type: PackageType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNumber()
  width_cm: number;

  @ApiProperty()
  @IsNumber()
  length_cm: number;

  @ApiProperty()
  @IsNumber()
  height_cm: number;

  @ApiProperty()
  @IsNumber()
  weight_kg: number;

  @ApiProperty()
  @IsNumber()
  basePrice: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  finalPrice?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPrincipal?: boolean;
}

export class OrderDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  shipment_type?: string;

  @ApiProperty()
  @IsString()
  recipient_name?: string;

  @ApiProperty()
  @IsString()
  recipient_phone: string;

  @ApiProperty()
  @IsString()
  delivery_district_name: string;

  @ApiProperty()
  @IsString()
  delivery_address: string;

  @ApiProperty()
  @IsString()
  delivery_coordinates: string;

  @ApiProperty()
  @IsString()
  delivery_date: string;

  @ApiProperty({ type: [OrderItemDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDTO)
  items: OrderItemDTO[];

  // @ApiProperty()
  // @IsString()
  // package_size_type: string;

  // @ApiProperty()
  // package_width_cm: number;

  // @ApiProperty()
  // package_length_cm: number;

  // @ApiProperty()
  // package_height_cm: number;

  // @ApiProperty()
  // package_weight_kg: number;

  @ApiProperty()
  @IsNumber()
  shipping_cost: number;

  @ApiProperty()
  @IsString()
  payment_method_for_shipping_cost: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  item_description: string;

  @ApiProperty()
  @IsNumber()
  amount_to_collect_at_delivery: number;

  @ApiProperty()
  @IsString()
  payment_method_for_collection: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observations: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  type_order_transfer_to_warehouse: string;

  @ApiProperty({ enum: STATES })
  @IsEnum(STATES)
  status: STATES;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  product_delivery_photo_url: string;

  @ApiProperty()
  @IsString()
  tracking_code: string;

  @ApiPropertyOptional()
  @IsOptional()
  isExpress?: string;
}

export class UpdateOrderRequestDto extends PartialType(OrderDTO) {
  // recipient_name?: string;
  // recipient_phone?: string;
  // delivery_district_name?: string;
  // delivery_address?: string;
  // package_size_type?: string;
  // package_width_cm?: number;
  // package_length_cm?: number;
  // package_height_cm?: number;
  // package_weight_kg?: number;
  // shipping_cost?: number;
  // item_description?: string;
  // observations?: string;
  // company_id?: string;
  // observation_shipping_cost_modification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observation_shipping_cost_modification?: string;
}
