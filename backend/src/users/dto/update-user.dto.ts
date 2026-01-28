import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Define the shape of the Student data
class UpdateStudentDto {
  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsString()
  studentCardNumber?: string;
}

// Define the shape of the Organizer data
class UpdateOrganizerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  website?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  
  // 👇 The @IsOptional and @ValidateNested decorators act as the "Entry Ticket"
  // allowing this data to pass through the security check.

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStudentDto)
  studentProfile?: UpdateStudentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateOrganizerDto)
  organizerProfile?: UpdateOrganizerDto;
}