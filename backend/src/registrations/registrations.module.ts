import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationsService } from './services/registrations.service';
import { RegistrationsController } from './controllers/registrations.controller';
import { Registration } from './entities/registration.entity';
import { AuthModule } from '../auth/auth.module';
import { StudentsModule } from '../students/students.module';
import { EventsModule } from '../events/events.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [TypeOrmModule.forFeature([Registration]),
    AuthModule,
    StudentsModule,
    EventsModule,
    MailerModule
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule { }
