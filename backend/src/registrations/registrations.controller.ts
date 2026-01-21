import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Roles} from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/Guards/roles.guard';
import { AuthGuard } from '../auth/Guards/auth.guard';


@Controller('registrations')
@UseGuards(AuthGuard, RolesGuard)
// JwtAuthGuard check if the user is logged in and has a valid token
// RolesGuard checks if the user has the appropriate role to access the endpoint

export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @Roles('student')
  create(@Body() createRegistrationDto: CreateRegistrationDto , @Req() req) {
    return this.registrationsService.create(createRegistrationDto, req.user.id);
  }

  @Get()
  @Roles('student')
  findAll(@Req() req) {
    return this.registrationsService.findAll(req.user.id);
  }

  @Get(':id')
  @Roles('student')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req ) {
    return this.registrationsService.findOne(id, req.user.id);
  }


  @Delete(':id')
  @Roles('student')
  cancelRegistration(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.registrationsService.cancelRegistration(id, req.user.id);
  }


}
