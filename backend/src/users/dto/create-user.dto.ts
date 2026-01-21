import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user.enums';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'User email' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'password123', description: 'Min 6 characters' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(255)
  password: string;

  @ApiProperty({
    enum: UserRole,
    required: false,
    default: UserRole.STUDENT,
    description: 'User role'
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
