import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { Registration } from './entities/registration.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Registration, Event, User]), AuthModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule { }
