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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('create/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/events',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  create(
    @Body() createEventDto: CreateEventDto,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Ajouter l'URL de l'image si un fichier a été uploadé
    const imageUrl = file
      ? `/uploads/events/${file.filename}`
      : createEventDto.imageUrl;

    const eventData = {
      ...createEventDto,
      imageUrl,
    };

    return this.eventsService.create(eventData, id);
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

  // Mettre à jour un événement
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/events',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updateData = { ...updateEventDto };
    if (file) {
      updateData.imageUrl = `/uploads/events/${file.filename}`;
    }
    return this.eventsService.update(id, updateData);
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
