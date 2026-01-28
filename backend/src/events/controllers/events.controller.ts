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
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { AuthGuard } from '../../auth/Guards/auth.guard';
import { RolesGuard } from '../../auth/Guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post('create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
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
    @Req() req,
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

    return this.eventsService.create(eventData, req.user.id);
  }

  //  Événements publics
  @Get('public')
  findAllPublic() {
    return this.eventsService.findAllPublic();
  }

  @Get('mine')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  findMine(@Req() req) {
    return this.eventsService.findByOrganizerUser(req.user.id);
  }

  // SEARCH - Rechercher des événements
  @Get('search')
  searchEvents(@Query('q') searchTerm: string) {
    return this.eventsService.searchEvents(searchTerm);
  }
  
  @Get('availability')
  getAvailableRooms(
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    return this.eventsService.getAvailableRooms(start, end);
  }
  // retourner un événement par ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // Mettre à jour un événement
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
