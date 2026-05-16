import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Password lama wajib diisi' })
  @IsString()
  oldPassword: string;

  @IsNotEmpty({ message: 'Password baru wajib diisi' })
  @IsString()
  @MinLength(8, { message: 'Password baru minimal 8 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password baru harus mengandung huruf dan angka',
  })
  newPassword: string;

  @IsNotEmpty({ message: 'Konfirmasi password wajib diisi' })
  @IsString()
  confirmPassword: string;
}
