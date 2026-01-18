import { Role } from '../../auth/enums/role.enum';

export class CreateUserDto {
    email: string;
    password: string;
    role: Role;
}
