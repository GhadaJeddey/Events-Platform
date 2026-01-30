import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Query,
    ParseUUIDPipe,
    ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './services/admin.service';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateOrganizerStatusDto } from './dto/update-organizer-status.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // --- EVENTS ROUTES ---
    @Get('events/pending')
    @ApiOperation({ summary: 'Get pending events (Admin)' })
    async getPendingEvents() {
        return this.adminService.getPendingEvents();
    }

    @Patch('events/:id/status')
    @ApiOperation({ summary: 'Update event status (Admin)' })
    async updateEventStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateEventStatusDto: UpdateEventStatusDto,
    ) {
        return this.adminService.updateEventStatus(id, updateEventStatusDto);
    }

    // --- ORGANIZERS ROUTES ---
    @Get('organizers/pending')
    @ApiOperation({ summary: 'Get pending organizers (Admin)' })
    async getPendingOrganizers() {
        return this.adminService.getPendingOrganizers();
    }

    @Get('organizers/most-active')
    @ApiOperation({ summary: 'Get most active organizers (Admin)' })
    async getMostActiveOrganizers() {
        return this.adminService.getMostActiveOrganizers(5);
    }

    @Patch('organizers/:id/status')
    @ApiOperation({ summary: 'Update organizer status (Admin)' })
    async updateOrganizerStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateOrganizerStatusDto: UpdateOrganizerStatusDto,
    ) {
        return this.adminService.updateOrganizerStatus(id, updateOrganizerStatusDto);
    }

    // --- USERS ROUTES ---
    @Get('users')
    @ApiOperation({ summary: 'Get all users (Admin)' })
    async getAllUsers(
        @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
        @Query('take', new ParseIntPipe({ optional: true })) take: number = 10,
    ) {
        return this.adminService.getAllUsers(skip, take);
    }

    @Patch('users/:id/role')
    @ApiOperation({ summary: 'Update user role (Admin)' })
    async updateUserRole(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserRoleDto: UpdateUserRoleDto,
    ) {
        return this.adminService.updateUserRole(id, updateUserRoleDto);
    }

    // --- REPORTS ROUTES ---
    @Get('reports')
    @ApiOperation({ summary: 'Get dashboard reports (Admin)' })
    async getReports() {
        return this.adminService.getDashboardStats();
    }

    @Get('recent-activity')
    @ApiOperation({ summary: 'Get recent activity (Admin)' })
    async getRecentActivity() {
        return this.adminService.getRecentActivity();
    }
}