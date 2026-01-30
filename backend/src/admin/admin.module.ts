import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';
import { User } from '../users/entities/user.entity';
import { Organizer } from '../organizers/entities/organizer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrganizersModule } from '../organizers/organizers.module';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organizer]), 
    JwtModule.registerAsync({ // Async to allow access to ConfigService before JwtModule is init . Dynamic load of config values 
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    EventsModule,
    OrganizersModule,
    UsersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
