import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationsService } from './services/registrations.service';
import { RegistrationsController } from './registrations.controller';
import { Registration } from './entities/registration.entity';
import { AuthModule } from '../auth/auth.module';
import { StudentsModule } from '../students/students.module';
import { EventsModule } from '../events/events.module';




@Module({
  imports: [TypeOrmModule.forFeature([Registration]),
    AuthModule,
    StudentsModule,
  forwardRef(() => EventsModule),
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule { }
