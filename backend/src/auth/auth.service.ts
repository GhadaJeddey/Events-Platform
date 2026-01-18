import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "../users/dto/SignInDto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
    ) { }

    register(body: CreateUserDto) {
        return this.usersService.create(body);
    }

    async login(body: SignInDto) {
        const user = await this.usersService.findByEmail(body.email);
        if (user && await bcrypt.compare(body.password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        throw new UnauthorizedException();
    }
}
