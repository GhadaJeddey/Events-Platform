import { forwardRef, Module } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentsModule } from '../students/students.module';
import { OrganizersModule } from '../organizers/organizers.module';

console.log('AuthService:', AuthService);

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => StudentsModule),
        forwardRef(() => OrganizersModule),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '2h' },
            }),
        }),
        TypeOrmModule.forFeature([User])
    ],
    providers: [AuthService, AuthGuard, RolesGuard],
    controllers: [AuthController],
    exports: [AuthService, JwtModule, PassportModule, AuthGuard, RolesGuard],
})
/**
 * Authentication module.
 * Manages user authentication, including registration and login.
 */
export class AuthModule {

}
