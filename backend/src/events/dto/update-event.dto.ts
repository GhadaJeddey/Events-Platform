import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsEnum(['draft', 'pending', 'approved', 'rejected', 'cancelled'])
  approvalStatus?: string;

  @IsOptional()
  @IsEnum(['upcoming', 'ongoing', 'completed'])
  eventStatus?: string;
}