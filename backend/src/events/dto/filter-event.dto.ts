import { IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';

export class FilterEventDto {
  @IsOptional()
  @IsEnum(['draft', 'pending', 'approved', 'rejected', 'cancelled'])
  approvalStatus?: string;

  @IsOptional()
  @IsEnum(['upcoming', 'ongoing', 'completed'])
  eventStatus?: string;

  @IsOptional()
  @IsUUID()
  clubId?: string;

  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @IsOptional()
  @IsDateString()
  startDateTo?: string;
}