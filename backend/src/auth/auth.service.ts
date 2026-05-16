import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyTotpDto } from './dto/verify-totp.dto';
import { MfaService } from './mfa.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mfaService: MfaService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const tempPayload = {
      sub: user.id,
      username: user.username,
      type: 'temp',
    };
    const tempToken = this.jwtService.sign(tempPayload, { expiresIn: '5m' });

    if (!user.mfaEnabled || !user.mfaSecret) {
      const { secret, otpauthUrl } = this.mfaService.generateSecret();
      const qrCode = await this.mfaService.generateQRCode(otpauthUrl);
      const encryptedSecret = this.mfaService.encryptSecret(secret);
      await this.usersService.updateMfaSecret(user.id, encryptedSecret);

      return {
        tempToken,
        requireMfaSetup: true,
        qrCode,
        message: 'Silakan scan QR code dengan aplikasi authenticator Anda',
      };
    }

    return {
      tempToken,
      requireMfaSetup: false,
      message: 'Silakan masukkan kode TOTP dari aplikasi authenticator Anda',
    };
  }

  async verifyTotp(verifyTotpDto: VerifyTotpDto) {
    let decoded: { sub: number; username: string; type: string };
    try {
      decoded = this.jwtService.verify(verifyTotpDto.tempToken) as { sub: number; username: string; type: string };
    } catch {
      throw new UnauthorizedException('Token tidak valid atau sudah kadaluarsa');
    }

    if (decoded.type !== 'temp') {
      throw new UnauthorizedException('Token tidak valid');
    }

    const user = await this.usersService.findById(decoded.sub);
    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('User tidak ditemukan atau MFA belum diaktifkan');
    }

    const decryptedSecret = this.mfaService.decryptSecret(user.mfaSecret);
    const isValid = this.mfaService.verifyToken(
      decryptedSecret,
      verifyTotpDto.totpCode,
    );

    if (!isValid) {
      throw new UnauthorizedException('Kode TOTP tidak valid');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      employeeId: user.employee ? user.employee.id : null,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        needResetPassword: user.needResetPassword,
        employee: user.employee
          ? {
              id: user.employee.id,
              name: user.employee.name,
              nip: user.employee.nip,
            }
          : null,
      },
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    // Validate confirm password matches
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Konfirmasi password tidak sesuai');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // Validate old password
    const isOldPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('Password lama tidak sesuai');
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);
    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: 'Password berhasil diubah' };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      needResetPassword: user.needResetPassword,
      employee: user.employee
        ? {
            id: user.employee.id,
            name: user.employee.name,
            nip: user.employee.nip,
          }
        : null,
    };
  }
}
