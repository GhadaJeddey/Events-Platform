import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post("create/:id")
  create(@Body() createEventDto: CreateEventDto, @Param('id') id: string) {
    this.eventsService.create(createEventDto, id);
  }


  //  Événements publics
  @Get('public')
  findAllPublic() {
    return this.eventsService.findAllPublic();
  }


  // retourner un événement par ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(':id/availability')
  checkAvailability(@Param('id') id: string) {
    return this.eventsService.checkAvailability(id);
  }

  // Mettre à jour un événement
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  //Incrémenter inscriptions
  @Patch(':id/register')
  incrementRegistrations(@Param('id') id: string) {
    return this.eventsService.incrementRegistrations(id);
  }

  //Décrémenter inscriptions
  @Patch(':id/unregister')
  decrementRegistrations(@Param('id') id: string) {
    return this.eventsService.decrementRegistrations(id);
  }

  // DELETE - Supprimer un événement
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}