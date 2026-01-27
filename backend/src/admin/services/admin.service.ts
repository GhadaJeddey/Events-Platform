import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity'; 
import { Event } from '../../events/entities/event.entity'; 
import { UpdateEventStatusDto } from '../dto/update-event-status.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { ApprovalStatus, EventStatus } from '../../common/enums/event.enums';


@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  // --- EVENTS LOGIC ---

  // Récupérer les événements en attente de validation
  async getPendingEvents() {
    return this.eventRepository.find({
      where: { approvalStatus: ApprovalStatus.PENDING }, 
      order: { startDate: 'ASC' }, 
      relations: ['organizer'], 
    });
  }

  // Approuver ou Rejeter un événement
  async updateEventStatus(id: string, updateEventStatusDto: UpdateEventStatusDto) {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);

    if (updateEventStatusDto.status === ApprovalStatus.APPROVED) {
        
        // Check ultime de conflit : On vérifie s'il existe UN AUTRE événement APPROUVÉ qui chevauche
        const conflict = await this.eventRepository.createQueryBuilder('e')
            .where('e.location = :loc', { loc: event.location })
            .andWhere('e.approvalStatus = :status', { status: ApprovalStatus.APPROVED })
            .andWhere('e.id != :id', { id: event.id }) 
            .andWhere('e.startDate < :end', { end: event.endDate })
            .andWhere('e.endDate > :start', { start: event.startDate })
            .getOne();

        if (conflict) {
            throw new ConflictException(
                `Conflit détecté ! La salle ${event.location} est déjà occupée par l'événement "${conflict.title}" sur ce créneau.`
            );
        }

        event.eventStatus = EventStatus.UPCOMING;
    }

    event.approvalStatus = updateEventStatusDto.status;
    return this.eventRepository.save(event);
}

  // --- USERS LOGIC ---

  async getAllUsers() {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive'],
    });
  }

  async updateUserRole(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.role = updateUserRoleDto.role;
    return this.userRepository.save(user);
  }

  // --- REPORTS / STATS ---
  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const totalEvents = await this.eventRepository.count();
    const pendingEvents = await this.eventRepository.count({
      where: { approvalStatus: ApprovalStatus.PENDING },
    });

    // Stats groupées par statut d'approbation 
    const eventsByStatus = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.approvalStatus', 'approvalStatus')
      .addSelect('COUNT(event.id)', 'count')
      .groupBy('event.approvalStatus')
      .getRawMany();

    // Stats groupées par Location (Salle) 
    const eventsByLocation = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.location', 'location')
      .addSelect('COUNT(event.id)', 'count')
      .groupBy('event.location')
      .orderBy('count', 'DESC') 
      .getRawMany();
    

    return {
      overview: {
        totalUsers,
        totalEvents,
        pendingEvents,
      },
      details: {
        eventsByApprovalStatus: eventsByStatus,
        eventsByLocation: eventsByLocation, 
      },
    };
  }
  async getRecentActivity(limit: number = 5) {
  return this.eventRepository.find({
    take: limit, 
    order: { createdAt: 'DESC' }, 
    relations: ['organizer', 'organizer.user'],
  });
}
}