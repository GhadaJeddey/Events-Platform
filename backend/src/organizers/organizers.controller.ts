import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizersService } from './services/organizers.service';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Organizers')
@Controller('organizers')
export class OrganizersController {
  constructor(private readonly organizersService: OrganizersService) { }

  @UseGuards(AuthGuard)
  @Post('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create current organizer profile' })
  async createMyProfile(@CurrentUser() user, @Body() createOrganizerDto: CreateOrganizerDto) {
    return this.organizersService.create(user, createOrganizerDto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current organizer profile' })
  findMyProfile(@CurrentUser() user) {
    return this.organizersService.findOneByUserId(user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current organizer profile' })
  async updateMyProfile(@CurrentUser() user, @Body() updateOrganizerDto: UpdateOrganizerDto) {
    const organizer = await this.organizersService.findOneByUserId(user.id);
    return this.organizersService.update(organizer.id, updateOrganizerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizers' })
  findAll() {
    return this.organizersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organizer by ID' })
  findOne(@Param('id') id: string) {
    return this.organizersService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organizer by ID (Admin)' })
  update(@Param('id') id: string, @Body() updateOrganizerDto: UpdateOrganizerDto) {
    return this.organizersService.update(id, updateOrganizerDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete organizer by ID (Admin)' })
  remove(@Param('id') id: string) {
    return this.organizersService.remove(id);
  }
}
