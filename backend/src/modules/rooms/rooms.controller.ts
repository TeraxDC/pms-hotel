import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Room } from './entities/room.entity';
import { RoomType } from './entities/room-type.entity';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  getAllRooms() {
    return this.roomsService.findAllRooms();
  }

  @Get('types')
  getAllTypes() {
    return this.roomsService.findAllRoomTypes();
  }

  @Get(':id')
  getRoomById(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findRoomById(id);
  }

  @Post('types')
  createType(@Body() data: Partial<RoomType>) {
    return this.roomsService.createRoomType(data);
  }

  @Put('types/:id')
  updateType(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<RoomType>) {
    return this.roomsService.updateRoomType(id, data);
  }

  @Delete('types/:id')
  deleteType(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.deleteRoomType(id);
  }

  @Post()
  createRoom(@Body() data: Partial<Room>) {
    return this.roomsService.createRoom(data);
  }

  @Put(':id')
  updateRoom(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<Room>) {
    return this.roomsService.updateRoom(id, data);
  }

  @Delete(':id')
  deleteRoom(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.deleteRoom(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { operational_status_id?: number; housekeeping_status_id?: number },
  ) {
    return this.roomsService.updateRoomStatus(id, body);
  }
}
