import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomType } from './entities/room-type.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(RoomType)
    private readonly roomTypeRepo: Repository<RoomType>,
  ) {}

  async findAllRooms() {
    return this.roomRepo.find({
      relations: { room_type: true, operational_status: true, housekeeping_status: true },
      order: { floor: 'ASC', room_number: 'ASC' },
    });
  }

  async findAllRoomTypes() {
    return this.roomTypeRepo.find({
      where: { is_active: true },
      relations: { rooms: true },
    });
  }

  async findRoomById(id: number) {
    const room = await this.roomRepo.findOne({
      where: { id },
      relations: { room_type: true, operational_status: true, housekeeping_status: true },
    });
    if (!room) throw new NotFoundException('Habitación no encontrada');
    return room;
  }

  async createRoomType(data: Partial<RoomType>) {
    const type = this.roomTypeRepo.create(data);
    return this.roomTypeRepo.save(type);
  }

  async updateRoomType(id: number, data: Partial<RoomType>) {
    const type = await this.roomTypeRepo.findOne({ where: { id } });
    if (!type) throw new NotFoundException('Tipo de habitación no encontrado');
    Object.assign(type, data);
    return this.roomTypeRepo.save(type);
  }

  async deleteRoomType(id: number) {
    const type = await this.roomTypeRepo.findOne({ where: { id } });
    if (!type) throw new NotFoundException('Tipo de habitación no encontrado');
    type.is_active = false;
    return this.roomTypeRepo.save(type);
  }

  async createRoom(data: Partial<Room>) {
    const room = this.roomRepo.create(data);
    return this.roomRepo.save(room);
  }

  async updateRoom(id: number, data: Partial<Room>) {
    const room = await this.findRoomById(id);
    if (!room) throw new NotFoundException('Habitación no encontrada');
    await this.roomRepo.update(id, data);
    return this.findRoomById(id);
  }

  async deleteRoom(id: number) {
    const room = await this.findRoomById(id);
    if (!room) throw new NotFoundException('Habitación no encontrada');
    room.is_active = false;
    return this.roomRepo.save(room);
  }

  async updateRoomStatus(
    id: number,
    data: { operational_status_id?: number; housekeeping_status_id?: number },
  ) {
    const room = await this.findRoomById(id);
    if (!room) throw new NotFoundException('Habitación no encontrada');

    // Validación operativa: Mientras la habitación esté con Check-In activo (Ocupada), no se permite alterar el estado de limpieza.
    if (data.housekeeping_status_id && data.housekeeping_status_id !== room.housekeeping_status_id) {
      if (
        room.operational_status?.code === 'OCCUPIED' &&
        (!data.operational_status_id || data.operational_status_id === room.operational_status_id)
      ) {
        throw new BadRequestException(
          `No está permitido cambiar el estado de limpieza mientras la habitación ${room.room_number} tenga un Check-In activo (Ocupada).`,
        );
      }
    }

    const updatePayload: any = {};
    if (data.operational_status_id) {
      updatePayload.operational_status_id = data.operational_status_id;
    }
    if (data.housekeeping_status_id) {
      updatePayload.housekeeping_status_id = data.housekeeping_status_id;
    }
    if (Object.keys(updatePayload).length > 0) {
      await this.roomRepo.update(id, updatePayload);
    }
    return this.findRoomById(id);
  }
}
