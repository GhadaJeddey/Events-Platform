import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { RoomReservationRequest } from './entities/room-reservation-request.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { EventsController } from './events.controller';
import { EventsService } from './services/events.service';
import { AuthModule } from '../auth/auth.module';
import { OrganizersModule } from '../organizers/organizers.module';
import { RegistrationsModule } from '../registrations/registrations.module';

console.log('EventsService:', EventsService);


@Module({
  imports: [TypeOrmModule.forFeature([Event, Registration, RoomReservationRequest]), AuthModule, OrganizersModule, forwardRef(() => RegistrationsModule)],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule { }
