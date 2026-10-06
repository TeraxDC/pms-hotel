import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase().trim() },
      relations: { role: true },
    });
    if (!user || !user.is_active) {
      return null;
    }
    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      return null;
    }
    return user;
  }

  async login(email: string, pass: string) {
    const user = await this.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas o usuario inactivo');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name,
      roleId: user.role_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role?.name,
        role_display_name: user.role?.display_name,
        permissions: user.role?.permissions || [],
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role?.name,
      role_display_name: user.role?.display_name,
      permissions: user.role?.permissions || [],
    };
  }
}
