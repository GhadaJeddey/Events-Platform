import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrganizersService } from '../services/organizers.service';
import { CreateOrganizerDto } from '../dto/create-organizer.dto';
import { UpdateOrganizerDto } from '../dto/update-organizer.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('organizers')
export class OrganizersController {
  constructor(private readonly organizersService: OrganizersService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  findMyProfile(@CurrentUser() user) {
    return this.organizersService.findOneByUserId(user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Patch('me')
  async updateMyProfile(@CurrentUser() user, @Body() updateOrganizerDto: UpdateOrganizerDto) {
    const organizer = await this.organizersService.findOneByUserId(user.id);
    return this.organizersService.update(organizer.id, updateOrganizerDto);
  }

  @Get()
  findAll() {
    return this.organizersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizerDto: UpdateOrganizerDto) {
    return this.organizersService.update(id, updateOrganizerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizersService.remove(id);
  }
}
