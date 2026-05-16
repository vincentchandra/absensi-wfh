import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyTotpDto {
  @IsNotEmpty({ message: 'Temporary token wajib diisi' })
  @IsString()
  tempToken: string;

  @IsNotEmpty({ message: 'TOTP code wajib diisi' })
  @IsString()
  totpCode: string;
}
