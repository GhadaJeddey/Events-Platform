import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Organizer } from '../organizers/entities/organizer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrganizersService } from '../organizers/services/organizers.service';
import { UsersService } from '../users/services/users.service';
import { EventsService } from '../events/services/events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Event, Organizer]), 
    JwtModule.registerAsync({ // Async to allow access to ConfigService before JwtModule is init . Dynamic load of config values 
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, OrganizersService, UsersService, EventsService]
})
export class AdminModule {}
