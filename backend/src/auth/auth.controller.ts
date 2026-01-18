import { Controller } from "@nestjs/common";
import { Post } from "@nestjs/common";
import { Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "../users/dto/SignInDto";

@Controller('auth')
/**
 * Controller for authentication endpoints.
 */
export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * Registers a new user.
     * @param {CreateUserDto} body - The user registration data.
     * @returns {Promise<UserEntity>} The created user.
     */
    @Post('register')
    async register(@Body() body: CreateUserDto) {
        return this.authService.register(body);
    }

    /**
     * Authenticates a user.
     * @param {SignInDto} body - The user login credentials.
     * @returns {Promise<UserEntity>} The user entity (without password) if successful.
     */
    @Post('login')
    async login(@Body() body: SignInDto) {
        return this.authService.authenticate(body);
    }
}

