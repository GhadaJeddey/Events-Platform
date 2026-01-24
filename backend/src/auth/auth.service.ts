import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/services/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "../users/dto/SignInDto";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/entities/user.entity";
import { StudentsService } from "../students/services/students.service";
import { OrganizersService } from "../organizers/services/organizers.service";
import { UserRole } from "../common/enums/user.enums";
@Injectable()
/**
 * Service for handling authentication logic.
 */
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private studentsService: StudentsService,
        private organizersService: OrganizersService,
    ) { }

    /**
     * Registers a new user.
     * @param {CreateUserDto} body - The user creation data.
     * @returns {Promise<User>} The created user entity.
     */
    async register(body: any) {
        const user = await this.usersService.create(body);

        if (user.role === UserRole.STUDENT) {
            await this.studentsService.create(user,{
                major: body.major || 'Undeclared',
                studentCardNumber: body.studentCardNumber || 'N/A',}
            );

        } else if (user.role === UserRole.ORGANIZER) {
            await this.organizersService.create(user, {
                name: body.organizationName || `${user.firstName} ${user.lastName}`,
                description: body.description,
                website: body.website,
            });
        }

        return user;
    }


    /**
     * Validates user credentials and logs them in.
     * @param {SignInDto} body - The login credentials.
     * @returns {Promise<Omit<User, 'password'>>} The user entity without password.
     * @throws {UnauthorizedException} If credentials are invalid.
     */
    async validateUser(input: SignInDto) {
        const user = await this.usersService.findByEmail(input.email);
        if (user && await bcrypt.compare(input.password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        throw new UnauthorizedException();
    }

    async SignIn(input: Omit<User, 'password'>) {
        const tokenPayload = {
            sub: input.id,
            email: input.email,
            role: input.role
        }
        const accesstoken = this.jwtService.sign(tokenPayload);
        return {
            input,
            accesstoken,
        };
    }

    async authenticate(input: SignInDto) {
        const user = await this.validateUser(input);
        return this.SignIn(user);
    }
}