import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SettingDTO {
  @ApiProperty()
  @IsString()
  business_name: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  phone_number: string;

  @ApiProperty()
  @IsString()
  logo_url: string;

  @ApiProperty()
  @IsString()
  terms_conditions_url: string;

  @ApiProperty()
  background_image_url: string;

  @ApiProperty()
  rates_image_url: string;

  @ApiProperty()
  excel_import_template_url: string;

  @ApiProperty()
  coverage_map_url: string;

  @ApiProperty()
  standard_measurements_width: number;

  @ApiProperty()
  standard_measurements_length: number;

  @ApiProperty()
  standard_measurements_height: number;

  @ApiProperty()
  standard_measurements_weight: number;

  @ApiProperty()
  maximum_measurements_width: number;

  @ApiProperty()
  maximum_measurements_length: number;

  @ApiProperty()
  maximum_measurements_height: number;

  @ApiProperty()
  maximum_measurements_weight: number;

  @ApiProperty()
  volumetric_factor: number;
}

export class SettingUpdateDTO {
  @ApiProperty()
  business_name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  phone_number: string;

  @ApiProperty()
  logo_url: string;

  @ApiProperty()
  background_image_url: string;

  @ApiProperty()
  rates_image_url: string;

  @ApiProperty()
  excel_import_template_url: string;

  @ApiProperty()
  coverage_map_url: string;

  @ApiProperty()
  standard_measurements_width: number;

  @ApiProperty()
  standard_measurements_length: number;

  @ApiProperty()
  standard_measurements_height: number;

  @ApiProperty()
  standard_measurements_weight: number;

  @ApiProperty()
  maximum_measurements_width: number;

  @ApiProperty()
  maximum_measurements_length: number;

  @ApiProperty()
  maximum_measurements_height: number;

  @ApiProperty()
  maximum_measurements_weight: number;

  @ApiProperty()
  volumetric_factor: number;
}
