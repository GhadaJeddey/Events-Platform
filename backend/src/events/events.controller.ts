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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { EventsService } from './services/events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateRoomReservationRequestDto } from './dto/create-room-reservation-request.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post('create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an event (Admin/Organizer)' })
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
      ...(imageUrl && { imageUrl }),
    };

    return this.eventsService.create(eventData, req.user.id);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all public events' })
  findAllPublic() {
    return this.eventsService.findAllPublic();
  }

  @Get('mine')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my events (Admin/Organizer)' })
  findMine(@Req() req) {
    return this.eventsService.findByOrganizerUser(req.user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search events by keyword' })
  searchEvents(@Query('q') searchTerm: string) {
    return this.eventsService.searchEvents(searchTerm);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get available rooms between dates' })
  getAvailableRooms(
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    return this.eventsService.getAvailableRooms(start, end);
  }

  @Get('availability/slots')
  @ApiOperation({ summary: 'Get room availability slots for a specific room and date range' })
  getRoomSlots(
    @Query('room') room: string,
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    return this.eventsService.getRoomSlots(room, start, end);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get event statistics' })
  getEventStatistics(@Param('id') id: string) {
    return this.eventsService.getEventStatistics(id);
  }

  @Patch(':id/edit')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event (Admin/Organizer)' })
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

  @Patch(':id/register')
  @ApiOperation({ summary: 'Increment registrations for event' })
  incrementRegistrations(@Param('id') id: string) {
    return this.eventsService.incrementRegistrations(id);
  }

  @Patch(':id/unregister')
  @ApiOperation({ summary: 'Decrement registrations for event' })
  decrementRegistrations(@Param('id') id: string) {
    return this.eventsService.decrementRegistrations(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event (Admin/Organizer)' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  // Room Reservation Requests endpoints
  @Post('rooms/reserve')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a room reservation (Organizer)' })
  requestRoomReservation(
    @Body() createRoomReservationRequestDto: CreateRoomReservationRequestDto,
    @Req() req
  ) {
    return this.eventsService.createRoomReservationRequest(
      createRoomReservationRequestDto,
      req.user.id
    );
  }

  @Get('rooms/reservations/pending')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending room reservation requests (Admin)' })
  getPendingRoomReservationRequests() {
    return this.eventsService.getPendingRoomReservationRequests();
  }

  @Get('rooms/reservations')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all room reservation requests (Admin)' })
  getRoomReservationRequests(
    @Query('status') status?: string,
    @Query('room') room?: string
  ) {
    return this.eventsService.getRoomReservationRequests(status as any, room as any);
  }

  @Patch('rooms/reservations/:id/approve')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a room reservation request (Admin)' })
  approveRoomReservationRequest(@Param('id') id: string) {
    return this.eventsService.approveRoomReservationRequest(id);
  }

  @Patch('rooms/reservations/:id/reject')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a room reservation request (Admin)' })
  rejectRoomReservationRequest(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason?: string
  ) {
    return this.eventsService.rejectRoomReservationRequest(id, rejectionReason);
  }
}
