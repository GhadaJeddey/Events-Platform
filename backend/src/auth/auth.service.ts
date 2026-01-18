import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "../users/dto/SignInDto";
import * as bcrypt from 'bcrypt';

@Injectable()
/**
 * Service for handling authentication logic.
 */
export class AuthService {
    constructor(
        private usersService: UsersService,
    ) { }

    /**
     * Registers a new user.
     * @param {CreateUserDto} body - The user creation data.
     * @returns {Promise<UserEntity>} The created user entity.
     */
    register(body: CreateUserDto) {
        return this.usersService.create(body);
    }

    /**
     * Validates user credentials and logs them in.
     * @param {SignInDto} body - The login credentials.
     * @returns {Promise<Omit<UserEntity, 'password'>>} The user entity without password.
     * @throws {UnauthorizedException} If credentials are invalid.
     */
    async login(body: SignInDto) {
        const user = await this.usersService.findByEmail(body.email);
        if (user && await bcrypt.compare(body.password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        throw new UnauthorizedException();
    }
}
