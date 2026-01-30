import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { UsersService } from "../../users/services/users.service";
import { SignInDto } from "../../users/dto/SignInDto";
import { ChangePasswordDto } from "../../users/dto/change-password.dto";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { User } from "../../users/entities/user.entity";
import { StudentsService } from "../../students/services/students.service";
import { OrganizersService } from "../../organizers/services/organizers.service";
import { Role } from "../../common/enums/role.enum";
import { UnifiedRegisterDto } from "../dto/unified-signup.dto";
import { ForgotPassDto } from "src/users/dto/forgot-password.dto";
import { ResetPasswordDto } from "src/users/dto/reset-password.dto";
import { nanoid } from "nanoid";
import { MailService } from "src/mail/mail.service";
@Injectable()

export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private studentsService: StudentsService,
        private organizersService: OrganizersService,
        private mailService: MailService,
    ) { }

    async register(dto: UnifiedRegisterDto) {
        const user = await this.usersService.create(dto.user);

        if (user.role === Role.STUDENT) {
            await this.studentsService.create(user, {
                major: dto.studentProfile?.major || 'Undeclared',
                studentCardNumber: dto.studentProfile?.studentCardNumber || 'N/A',
            }
            );

        } else if (user.role === Role.ORGANIZER) {
            await this.organizersService.create(user, {
                name: dto.organizerProfile?.name || `${user.firstName} ${user.lastName}`,
                description: dto.organizerProfile?.description,
                website: dto.organizerProfile?.website,
            });
        }

        return user;
    }

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

    async forgotPassword(input: ForgotPassDto) {
        const user = await this.usersService.findByEmail(input.email);
        if (!user) {
            return ("if user exists , an email will be sent");
        }

        const resetToken = nanoid(64);
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 3600000);
        await this.usersService.update(user.id, user);
        await this.mailService.sendPasswordResetEmail(user.email, resetToken);

        return { message: "If user exists, an email will be sent" };
    }

    // function used when user clicks on forgot password at login
    async resetPassword(input: ResetPasswordDto) {
        const users = await this.usersService.findAll();
        const user = users.find(u => u.resetToken === input.token);

        if (!user) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            throw new BadRequestException("Reset token has expired");
        }

        // Pass plain password to usersService.update, it handles hashing
        // We also pass resetToken and resetTokenExpiry as null to clear them
        // We cast to any to bypass DTO strict typing for these internal fields
        await this.usersService.update(user.id, {
            password: input.newPassword,
            resetToken: null,
            resetTokenExpiry: null
        } as any);

        return { message: "Password successfully reset" };
    }

    // function used when logged in user wants to change password
    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
        return this.usersService.changePassword(userId, changePasswordDto);
    }
}