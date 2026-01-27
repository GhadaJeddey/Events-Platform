import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';


export class UpdateUserRoleDto {
  @ApiProperty({
    enum: Role,
    description: 'Le nouveau rôle de l\'utilisateur',
    example: Role.ORGANIZER,
  })
  @IsNotEmpty()
  @IsEnum(Role, {
    message: `Le rôle doit être l'une des valeurs suivantes : ${Object.values(Role).join(', ')}`,
  })
  role: Role;
}