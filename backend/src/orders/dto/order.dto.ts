import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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
  item_description: string;

  @ApiProperty()
  amount_to_collect_at_delivery: number;

  @ApiProperty()
  payment_method_for_collection: string;

  @ApiProperty()
  observations: string;

  @ApiProperty()
  type_order_transfer_to_warehouse: string;
}

export class OrderUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  shipment_type?: string;

  @ApiProperty()
  @IsNotEmpty()
  recipient_name?: string;

  @ApiProperty()
  @IsNotEmpty()
  recipient_phone: string;

  @ApiProperty()
  @IsNotEmpty()
  delivery_district_name: string;

  @ApiProperty()
  @IsNotEmpty()
  delivery_address: string;

  @ApiProperty()
  @IsNotEmpty()
  delivery_coordinates: string;

  @ApiProperty()
  @IsNotEmpty()
  delivery_date: string;

  @ApiProperty()
  @IsNotEmpty()
  package_size_type: string;

  @ApiProperty()
  @IsNotEmpty()
  package_width_cm: number;

  @ApiProperty()
  @IsNotEmpty()
  package_length_cm: number;

  @ApiProperty()
  @IsNotEmpty()
  package_height_cm: number;

  @ApiProperty()
  @IsNotEmpty()
  package_weight_kg: number;

  @ApiProperty()
  @IsNotEmpty()
  shipping_cost: number;

  @ApiProperty()
  @IsNotEmpty()
  item_description: string;

  @ApiProperty()
  @IsNotEmpty()
  amount_to_collect_at_delivery: number;

  @ApiProperty()
  @IsNotEmpty()
  payment_method_for_collection: string;

  @ApiProperty()
  @IsNotEmpty()
  observations: string;

  @ApiProperty()
  @IsNotEmpty()
  type_order_transfer_to_warehouse: string;
}
