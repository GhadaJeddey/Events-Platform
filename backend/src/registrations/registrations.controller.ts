import { RegistrationsService } from './services/registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Controller, UseGuards, Post, Get, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Registrations')
@ApiBearerAuth()
@Controller('registrations')
@UseGuards(AuthGuard, RolesGuard)

export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) { }

  // --- STUDENT ROUTES ---

  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Create a registration (Student)' })
  create(@Body() createRegistrationDto: CreateRegistrationDto, @CurrentUser() user) {
    return this.registrationsService.create(createRegistrationDto, user.id);
  }

  @Get()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get my registrations (Student)' })
  findAll(@CurrentUser() user) {
    return this.registrationsService.findAll(user.id);
  }

  @Get(':id')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get a registration by ID (Student)' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user) {
    return this.registrationsService.findOne(id, user.id);
  }

  @Delete(':id')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Cancel a registration (Student)' })
  cancelRegistration(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user) {
    return this.registrationsService.cancelRegistration(id, user.id);
  }

  // --- ORGANIZER ROUTES ---

  @Get('event/:eventId')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  @ApiOperation({ summary: 'Get registrations for an event (Organizer/Admin)' })
  async getEventRegistrations(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.registrationsService.getEventRegistrations(eventId);
  }


}
