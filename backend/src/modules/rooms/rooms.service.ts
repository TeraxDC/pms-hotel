import { Injectable, NotFoundException } from '@nestjs/common';
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

  async createRoom(data: Partial<Room>) {
    const room = this.roomRepo.create(data);
    return this.roomRepo.save(room);
  }

  async updateRoomStatus(
    id: number,
    data: { operational_status_id?: number; housekeeping_status_id?: number },
  ) {
    const room = await this.findRoomById(id);
    if (data.operational_status_id) {
      room.operational_status_id = data.operational_status_id;
    }
    if (data.housekeeping_status_id) {
      room.housekeeping_status_id = data.housekeeping_status_id;
    }
    await this.roomRepo.save(room);
    return this.findRoomById(id);
  }
}
