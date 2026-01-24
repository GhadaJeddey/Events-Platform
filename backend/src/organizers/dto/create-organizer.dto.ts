import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateOrganizerDto {
  @ApiProperty({ example: 'IEEE INSAT', description: 'Name of the organization' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Computer Science Club', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://ieee-insat.org', required: false })
  @IsUrl() 
  @IsOptional()
  website?: string;
}