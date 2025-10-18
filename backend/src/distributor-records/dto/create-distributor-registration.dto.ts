import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateDistributorRegistrationDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{8}$/, { message: 'El DNI debe tener 8 dígitos.' })
  clientDni: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{9}$/, { message: 'El teléfono debe tener 9 dígitos.' })
  clientPhone: string;

  @IsString()
  @IsOptional()
  observation: string;

  @IsString()
  @IsNotEmpty()
  destinationAddress: string;
}
