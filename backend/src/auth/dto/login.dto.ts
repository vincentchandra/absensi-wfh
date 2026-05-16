import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Username wajib diisi' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  password: string;
}
