import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user.enums';


export class UpdateUserRoleDto {
  @ApiProperty({
    enum: UserRole,
    description: 'Le nouveau rôle de l\'utilisateur',
    example: UserRole.ORGANIZER,
  })
  @IsNotEmpty()
  @IsEnum(UserRole, {
    message: `Le rôle doit être l'une des valeurs suivantes : ${Object.values(UserRole).join(', ')}`,
  })
  role: UserRole;
}