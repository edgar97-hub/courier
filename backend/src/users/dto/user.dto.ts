import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ACCESS_LEVEL, ROLES } from 'src/constants/roles';

export class UserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ROLES)
  role: ROLES;

  @ApiProperty()
  business_type: string;

  @ApiProperty()
  business_name: string;

  @ApiProperty()
  business_district: string;

  @ApiProperty()
  business_address: string;

  @ApiProperty()
  business_phone_number: string;

  @ApiProperty()
  business_sector: string;

  @ApiProperty()
  business_document_type: string;

  @ApiProperty()
  business_email: string;

  @ApiProperty()
  assumes_5_percent_pos: boolean;

  @ApiProperty()
  business_document_number: string;

  @ApiProperty()
  owner_name: string;

  @ApiProperty()
  owner_phone_number: string;

  @ApiProperty()
  owner_document_type: string;

  @ApiProperty()
  owner_document_number: string;

  @ApiProperty()
  owner_email_address: string;

  @ApiProperty()
  owner_bank_account: string;

  @ApiProperty()
  name_account_number_owner: string;
}

export class UserUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ROLES)
  role: ROLES;

  @ApiProperty()
  business_type: string;

  @ApiProperty()
  business_name: string;

  @ApiProperty()
  business_district: string;

  @ApiProperty()
  business_address: string;

  @ApiProperty()
  business_phone_number: string;

  @ApiProperty()
  business_sector: string;

  @ApiProperty()
  business_document_type: string;

  @ApiProperty()
  business_email: string;

  @ApiProperty()
  assumes_5_percent_pos: boolean;

  @ApiProperty()
  business_document_number: string;

  @ApiProperty()
  owner_name: string;

  @ApiProperty()
  owner_phone_number: string;

  @ApiProperty()
  owner_document_type: string;

  @ApiProperty()
  owner_document_number: string;

  @ApiProperty()
  owner_email_address: string;

  @ApiProperty()
  owner_bank_account: string;

  @ApiProperty()
  name_account_number_owner: string;
}

export class UserProfile {
  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @IsOptional()
  password?: string;

  @ApiProperty()
  photo_url: string;
}

export class UserCompany {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  owner_phone_number: string;

  @ApiProperty()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ROLES)
  role?: ROLES;
}
