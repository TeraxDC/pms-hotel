import { IsNotEmpty, IsEmail, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';

export class InitializeHotelDto {
  // Hotel Info
  @IsNotEmpty({ message: 'El nombre del hotel es obligatorio' })
  @IsString()
  hotel_name: string;

  @IsOptional()
  @IsString()
  trade_name?: string;

  @IsOptional()
  @IsString()
  tax_id?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty({ message: 'El WhatsApp de contacto es obligatorio' })
  @IsString()
  whatsapp: string;

  @IsNotEmpty({ message: 'El correo electrónico del hotel es obligatorio' })
  @IsEmail({}, { message: 'El correo del hotel debe tener un formato válido' })
  email: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  primary_currency?: string;

  @IsOptional()
  @IsString()
  currency_symbol?: string;

  @IsOptional()
  @IsString()
  tax_name?: string;

  @IsOptional()
  @IsNumber()
  tax_percentage?: number;

  @IsOptional()
  @IsString()
  check_in_time?: string;

  @IsOptional()
  @IsString()
  check_out_time?: string;

  // Superadmin Info
  @IsNotEmpty({ message: 'El nombre del superadministrador es obligatorio' })
  @IsString()
  admin_name: string;

  @IsNotEmpty({ message: 'El correo del superadministrador es obligatorio' })
  @IsEmail({}, { message: 'El correo del administrador debe tener un formato válido' })
  admin_email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe contener al menos 8 caracteres' })
  admin_password: string;

  @IsOptional()
  @IsString()
  admin_pin?: string;
}
