import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class DistrictDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  weight_from: number;

  @ApiProperty()
  @IsNotEmpty()
  weight_to: number;

  @ApiProperty()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  isStandard: boolean;

  @ApiProperty()
  @IsOptional()
  isExpress: boolean;

  @ApiProperty()
  @IsOptional()
  surchargePercentage: number;

  // @ApiProperty()
  // @IsOptional()
  // priceWithSurcharge: number;
}

export class DistrictUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  weight_from: number;

  @ApiProperty()
  @IsNotEmpty()
  weight_to: number;

  @ApiProperty()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  isStandard: boolean;

  @ApiProperty()
  @IsOptional()
  isExpress: boolean;

  @ApiProperty()
  @IsOptional()
  surchargePercentage: number;

  // @ApiProperty()
  // @IsOptional()
  // priceWithSurcharge: number;
}
