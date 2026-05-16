import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty({ message: 'NIP wajib diisi' })
  @IsString()
  nip: string;

  @IsNotEmpty({ message: 'Nama wajib diisi' })
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @IsNotEmpty({ message: 'Department wajib diisi' })
  @IsString()
  department: string;

  @IsNotEmpty({ message: 'Posisi wajib diisi' })
  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
