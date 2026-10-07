import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seedRolePermissions();
  }

  async seedRolePermissions() {
    const defaultPermissions: Record<string, string[]> = {
      SUPERADMIN: ['*'],
      ADMIN: [
        'rack:*',
        'rooms:*',
        'reservations:*',
        'cash:*',
        'housekeeping:*',
        'reports:*',
        'cms:*',
        'users:view',
        'users:manage',
        'statuses:view',
      ],
      RECEPTIONIST: [
        'rack:view',
        'rack:walkin',
        'rack:checkin',
        'rack:checkout',
        'rooms:view',
        'reservations:view',
        'reservations:create',
        'reservations:checkin',
        'reservations:checkout',
        'reservations:folio',
        'cash:view',
        'cash:shift',
        'cash:movement',
        'housekeeping:view',
      ],
      HOUSEKEEPING: [
        'housekeeping:view',
        'housekeeping:manage',
        'rack:view',
      ],
    };

    const roles = await this.roleRepo.find();
    for (const role of roles) {
      if (!role.permissions || role.permissions.length === 0) {
        if (defaultPermissions[role.name]) {
          role.permissions = defaultPermissions[role.name];
          await this.roleRepo.save(role);
        }
      }
    }
  }

  async findAll() {
    const users = await this.userRepo.find({
      relations: { role: true },
      order: { id: 'ASC' },
    });
    return users.map((u) => {
      const { password_hash, ...rest } = u;
      return rest;
    });
  }

  async findAllRoles() {
    return this.roleRepo.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { role: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { password_hash, ...rest } = user;
    return rest;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new BadRequestException('Ya existe un usuario con este correo electrónico');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      full_name: dto.full_name,
      email: dto.email.toLowerCase().trim(),
      password_hash: passwordHash,
      role_id: dto.role_id,
      pin_code: dto.pin_code || '1234',
      phone: dto.phone || '',
      is_active: dto.is_active !== undefined ? dto.is_active : true,
    });

    const saved = await this.userRepo.save(user);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email.toLowerCase().trim() },
      });
      if (existing) {
        throw new BadRequestException('El correo ya está en uso por otro usuario');
      }
      user.email = dto.email.toLowerCase().trim();
    }

    if (dto.full_name) user.full_name = dto.full_name;
    if (dto.role_id) user.role_id = dto.role_id;
    if (dto.pin_code !== undefined) user.pin_code = dto.pin_code;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.is_active !== undefined) user.is_active = dto.is_active;

    if (dto.password && dto.password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(dto.password.trim(), salt);
    }

    await this.userRepo.save(user);
    return this.findOne(id);
  }

  async toggleActive(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { role: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.role?.name === 'SUPERADMIN') {
      throw new BadRequestException('No se puede desactivar la cuenta del Superadministrador maestro');
    }

    user.is_active = !user.is_active;
    await this.userRepo.save(user);
    return this.findOne(id);
  }
}
