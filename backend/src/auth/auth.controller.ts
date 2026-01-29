import { Controller } from "@nestjs/common";
import { Post } from "@nestjs/common";
import { Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto } from "../users/dto/SignInDto";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "./guards/auth.guard";
import { Get } from "@nestjs/common";
import { Request } from "@nestjs/common";
import { RolesGuard } from './guards/roles.guard';
import { Roles } from "./decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { UnifiedRegisterDto } from "./dto/unified-signup.dto";
import { ForgotPassDto } from "src/users/dto/forgot-password.dto";
import { ResetPasswordDto } from "src/users/dto/reset-password.dto";


@Controller('auth')

export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * Registers a new user.
     * @param {CreateUserDto} body - The user registration data.
     * @returns {Promise<UserEntity>} The created user.
     */
    @Post('register')
    async register(@Body() body: UnifiedRegisterDto) {
        console.log('Received registration body:', JSON.stringify(body, null, 2));
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

    @UseGuards(AuthGuard)
    @Get('me')
    getUserInfo(@Request() req) {
        return req.user;
    }

    @Get('admin-only')
    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    async adminOnly() {
        return 'Direct access for admins only';
    }
    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPassDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
}

