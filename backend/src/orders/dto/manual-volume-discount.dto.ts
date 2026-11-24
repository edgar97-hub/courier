import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ManualApplyVolumeDiscountDto {
  @ApiProperty({ example: 10, minimum: 0.01, maximum: 100 })
  @IsNumber()
  @Min(0.01)
  @Max(100)
  percentage: number;

  @ApiPropertyOptional({ example: 'Ajuste solicitado por el cliente' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ManualDiscountReasonDto {
  @ApiPropertyOptional({ example: 'Ajuste solicitado por el cliente' })
  @IsOptional()
  @IsString()
  reason?: string;
}
