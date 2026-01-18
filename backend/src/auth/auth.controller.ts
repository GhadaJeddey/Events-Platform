import { Controller } from "@nestjs/common";
import { Post } from "@nestjs/common";
import { Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "../users/dto/SignInDto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() body: CreateUserDto) {
        return this.authService.register(body);
    }
    @Post('login')
    async login(@Body() body: SignInDto) {
        return this.authService.login(body);
    }
}

