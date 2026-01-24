import { IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { CreateStudentDto } from '../../students/dto/create-student.dto';
import { CreateOrganizerDto } from '../../organizers/dto/create-organizer.dto';
import { UserRole } from '../../common/enums/user.enums';

export class UnifiedRegisterDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto; // Contient email, password, firstName, lastName

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateStudentDto)
  studentProfile?: CreateStudentDto; // studentCardNumber, major

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateOrganizerDto)
  organizerProfile?: CreateOrganizerDto; // name, website, description

  
}