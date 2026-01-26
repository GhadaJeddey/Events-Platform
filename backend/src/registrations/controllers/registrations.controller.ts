import { RegistrationsService } from '../services/registrations.service';
import { CreateRegistrationDto } from '../dto/create-registration.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/Guards/roles.guard';
import { AuthGuard } from '../../auth/Guards/auth.guard';
import { Role } from '../../common/enums/role.enum';


@Controller('registrations')
@UseGuards(AuthGuard, RolesGuard)
// JwtAuthGuard check if the user is logged in and has a valid token
// RolesGuard checks if the user has the appropriate role to access the endpoint

export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) { }

  @Post()
  @Roles(Role.STUDENT)
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
