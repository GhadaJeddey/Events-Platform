import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from "./services/auth.service";
import { SignInDto } from "../users/dto/SignInDto";
import { ChangePasswordDto } from "../users/dto/change-password.dto";
import { AuthGuard } from "./Guards/auth.guard";
import { RolesGuard } from './Guards/roles.guard';
import { Roles } from "./decorators/roles.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Role } from "src/common/enums/role.enum";
import { UnifiedRegisterDto } from "./dto/unified-signup.dto";
import { ForgotPassDto } from "src/users/dto/forgot-password.dto";
import { ResetPasswordDto } from "src/users/dto/reset-password.dto";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user (student or organizer)' })
    async register(@Body() body: UnifiedRegisterDto) {
        console.log('Received registration body:', JSON.stringify(body, null, 2));
        return this.authService.register(body);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login and get access token' })
    async login(@Body() body: SignInDto) {
        return this.authService.authenticate(body);
    }

    @UseGuards(AuthGuard)
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current authenticated user' })
    async getUserInfo(@CurrentUser() user: any) {
        return user;
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset email' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPassDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password with token' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @UseGuards(AuthGuard)
    @Post('change-password')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change password for current user' })
    async changePassword(
        @CurrentUser('id') userId: string,
        @Body() changePasswordDto: ChangePasswordDto
    ) {
        return this.authService.changePassword(userId, changePasswordDto);
    }
}

