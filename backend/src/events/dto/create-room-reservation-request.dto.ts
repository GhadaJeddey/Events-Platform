import { IsDateString, IsEnum, IsString, IsOptional, MinLength } from 'class-validator';
import { RoomLocation } from 'src/common/enums/room-location.enum';

export class CreateRoomReservationRequestDto {
  @IsEnum(RoomLocation)
  room: RoomLocation;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  eventTitle?: string;
}
