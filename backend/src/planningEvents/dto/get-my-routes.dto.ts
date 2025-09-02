import { IsString, IsNotEmpty } from 'class-validator';

export class GetMyRoutesDto {
  @IsString()
  @IsNotEmpty()
  date: string;
}