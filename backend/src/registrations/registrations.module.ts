import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationsService } from './services/registrations.service';
import { RegistrationsController } from './controllers/registrations.controller';
import { Registration } from './entities/registration.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { StudentsModule } from 'src/students/students.module';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([Registration]), AuthModule, StudentsModule, EventsModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule { }
