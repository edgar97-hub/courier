import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { STATES } from 'src/constants/roles';
import { PartialType } from '@nestjs/swagger';

export class OrderDTO {
  @ApiProperty()
  shipment_type?: string;

  @ApiProperty()
  recipient_name?: string;

  @ApiProperty()
  recipient_phone: string;

  @ApiProperty()
  delivery_district_name: string;

  @ApiProperty()
  delivery_address: string;

  @ApiProperty()
  delivery_coordinates: string;

  @ApiProperty()
  delivery_date: string;

  @ApiProperty()
  package_size_type: string;

  @ApiProperty()
  package_width_cm: number;

  @ApiProperty()
  package_length_cm: number;

  @ApiProperty()
  package_height_cm: number;

  @ApiProperty()
  package_weight_kg: number;

  @ApiProperty()
  shipping_cost: number;

  @ApiProperty()
  payment_method_for_shipping_cost: string;

  @ApiProperty()
  item_description: string;

  @ApiProperty()
  amount_to_collect_at_delivery: number;

  @ApiProperty()
  payment_method_for_collection: string;

  @ApiProperty()
  observations: string;

  @ApiProperty()
  type_order_transfer_to_warehouse: string;

  @ApiProperty()
  @IsEnum(STATES)
  status: STATES;

  @ApiProperty()
  product_delivery_photo_url: string;

  @ApiProperty()
  tracking_code: string;

  @ApiProperty()
  isExpress?: string;
}

export class UpdateOrderRequestDto extends PartialType(OrderDTO) {
  recipient_name?: string;
  recipient_phone?: string;
  delivery_district_name?: string;
  delivery_address?: string;
  package_size_type?: string;
  package_width_cm?: number;
  package_length_cm?: number;
  package_height_cm?: number;
  package_weight_kg?: number;
  shipping_cost?: number;
  item_description?: string;
  observations?: string;
  company_id?: string;
  observation_shipping_cost_modification?: string;
}
