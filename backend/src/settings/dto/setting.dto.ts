import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class PromotionalSetItemDto {
  @IsUUID()
  @IsNotEmpty() // Asumimos que el ID se genera en el frontend para cada item del array
  id: string;

  @IsOptional()
  // @IsUrl({}, { message: 'La URL de la imagen no es válida.' })
  @MaxLength(1024)
  imageUrl: string | null;

  @IsOptional()
  // @IsUrl({}, { message: 'El enlace URL no es válido.' })
  @MaxLength(1024)
  linkUrl: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  buttonText: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class SettingDTO {
  @ApiProperty()
  @IsString()
  business_name: string;

  @ApiProperty()
  @IsString()
  ruc: string;

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
  ruc: string;

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
  global_notice_image_url: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // Valida cada objeto en el array
  @ArrayMaxSize(3, {
    message: 'Se permite un máximo de 3 conjuntos promocionales.',
  })
  @Type(() => PromotionalSetItemDto)
  promotional_sets?: PromotionalSetItemDto[];

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
