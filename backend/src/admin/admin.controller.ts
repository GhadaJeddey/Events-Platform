import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    ParseIntPipe,
    ParseUUIDPipe,
    UseGuards
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';



import { AuthGuard } from '../auth/Guards/auth.guard';
import { RolesGuard } from '../auth/Guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // --- EVENTS ROUTES ---

    @Get('events/pending')
    getPendingEvents() {
        return this.adminService.getPendingEvents();
    }

    @Patch('events/:id/status')
    updateEventStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateEventStatusDto: UpdateEventStatusDto,
    ) {
        return this.adminService.updateEventStatus(id, updateEventStatusDto);
    }

    // --- USERS ROUTES ---
    @Get('users')
    getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Patch('users/:id/role')
    updateUserRole(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserRoleDto: UpdateUserRoleDto,
    ) {
        return this.adminService.updateUserRole(id, updateUserRoleDto);
    }

    // --- REPORTS ROUTES ---

    @Get('reports')
    getReports() {
        return this.adminService.getDashboardStats();
    }
}