import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class DistributorRecordDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  clientName: string;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  clientDni: string;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  clientPhone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  destinationAddress: string;
}

import { PartialType } from '@nestjs/swagger';

export class UpdateDistributorRecordDTO extends PartialType(
  DistributorRecordDTO,
) {}
