import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

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

    // Build JWT payload — only non-sensitive data
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
          ? { id: user.employee.id, name: user.employee.name, nip: user.employee.nip }
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
        ? { id: user.employee.id, name: user.employee.name, nip: user.employee.nip }
        : null,
    };
  }
}
