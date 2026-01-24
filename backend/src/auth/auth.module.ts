import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Student } from 'src/students/entities/student.entity';
import { StudentsModule } from 'src/students/students.module';
import { OrganizersModule } from 'src/organizers/organizers.module';

@Module({
    imports: [
        UsersModule,
        StudentsModule,
        OrganizersModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
        }),
        TypeOrmModule.forFeature([User])
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService, JwtModule, PassportModule],
})
/**
 * Authentication module.
 * Manages user authentication, including registration and login.
 */
export class AuthModule { }
