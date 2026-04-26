import { IsEmail, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class CreateContactRequestDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null && String(v).trim() !== '')
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  service?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  budget?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}
