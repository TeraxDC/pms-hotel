import { IsNotEmpty, IsEmail, IsString, MinLength, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @IsString()
  full_name: string;

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'Formato de correo inválido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsNumber()
  role_id: number;

  @IsOptional()
  @IsString()
  pin_code?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
