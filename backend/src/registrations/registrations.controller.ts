import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Role } from '../auth/enums/role.enum';


@Controller('registrations')
@UseGuards(AuthGuard, RolesGuard)
// JwtAuthGuard check if the user is logged in and has a valid token
// RolesGuard checks if the user has the appropriate role to access the endpoint

export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) { }

  @Post()
  @Roles(Role.STUDENT)////Roumaissa modifie  iciiiii
  create(@Body() createRegistrationDto: CreateRegistrationDto, @Req() req) {
    return this.registrationsService.create(createRegistrationDto, req.user.id);
  }

  @Get()
  @Roles(Role.STUDENT)
  findAll(@Req() req) {
    return this.registrationsService.findAll(req.user.id);
  }

  @Get(':id')
  @Roles(Role.STUDENT)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.registrationsService.findOne(id, req.user.id);
  }


  @Delete(':id')
  @Roles(Role.STUDENT)
  cancelRegistration(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.registrationsService.cancelRegistration(id, req.user.id);
  }


}
