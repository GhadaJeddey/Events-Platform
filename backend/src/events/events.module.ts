import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventsController } from './controllers/events.controller';
import { EventsService } from './services/events.service';
import { AuthModule } from '../auth/auth.module';
import { OrganizersModule } from '../organizers/organizers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), AuthModule, OrganizersModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule { }
