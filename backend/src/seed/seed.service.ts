import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminExists = await this.userRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (!adminExists) {
      console.log('Seeding initial admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const adminUser = this.userRepository.create({
        username: 'admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
        needResetPassword: false, // Admin tidak perlu force reset
      });

      await this.userRepository.save(adminUser);
      console.log('Admin user created (username: admin, password: admin123)');
    }
  }
}
