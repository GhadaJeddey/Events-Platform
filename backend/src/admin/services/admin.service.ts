import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateEventStatusDto } from '../dto/update-event-status.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateOrganizerStatusDto } from '../dto/update-organizer-status.dto';
import { OrganizerStatus } from '../../common/enums/organizers.enum';
import { UsersService } from '../../users/services/users.service';
import { EventsService } from '../../events/services/events.service';
import { OrganizersService } from '../../organizers/services/organizers.service';


@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    private readonly organizersService: OrganizersService,
  ) { }

  // --- EVENTS LOGIC ---

  async getPendingEvents() {
    return this.eventsService.getPendingEvents();
  }

  async updateEventStatus(id: string, updateEventStatusDto: UpdateEventStatusDto) {
    return this.eventsService.updateApprovalStatus(id, updateEventStatusDto.status);
  }



  // --- USERS LOGIC ---

  async getAllUsers(skip: number = 0, take: number = 10) {
    const [users, total] = await Promise.all([   //Promise.all : exec // de users et total 
      this.usersService.findAllPaginated(skip, take),
      this.usersService.countAll(),
    ]);

    return {
      data: users,
      total,
      skip,
      take,
      pageCount: Math.ceil(total / take),
    };
  }

  async updateUserRole(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    return this.usersService.update(id, { role: updateUserRoleDto.role });
  }

  // --- REPORTS / STATS ---

  async getDashboardStats() {
    const [totalUsers, eventStats] = await Promise.all([
      this.usersService.countAll(),
      this.eventsService.getDashboardStats(),
    ]);

    return {
      overview: {
        totalUsers: totalUsers,
        totalEvents: eventStats.totalEvents,
        pendingEvents: eventStats.pendingEvents,
      },
      details: {
        eventsByApprovalStatus: eventStats.eventsByStatus,
        eventsByLocation: eventStats.eventsByLocation,
      },
    };
  }

  async getRecentActivity(limit: number = 5) {
    return this.eventsService.getRecentActivity(limit);
  }

  // --- ORGANIZERS LOGIC ---

  async getPendingOrganizers() {
    return this.organizersService.getPendingOrganizers();
  }

  async findMostActiveOrganizers(limit: number = 4) {
    return this.organizersService.findMostActiveOrganizers(limit);
  }

  async updateOrganizerStatus(id: string, updateOrganizerStatusDto: UpdateOrganizerStatusDto) {
    if (updateOrganizerStatusDto.status === OrganizerStatus.APPROVED) {
      await this.organizersService.approveOrganizer(id);
      return { message: 'Organisateur approuvé' };
    }
    else if (updateOrganizerStatusDto.status === OrganizerStatus.REJECTED) {
      await this.organizersService.rejectOrganizer(id);
      return { message: 'Demande d\'organisateur supprimée' };
    }
    else {
      throw new BadRequestException('Statut invalide pour l\'organisateur');
    }
  }

}
