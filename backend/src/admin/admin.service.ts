import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity'; 
import { Event } from '../events/entities/event.entity'; 
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { ApprovalStatus, EventStatus } from '../common/enums/event.enums';

// recommendation : use the service instead of the repository directly. 

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  // --- EVENTS LOGIC ---

  // 1. Récupérer les événements en attente de validation
  async getPendingEvents() {
    return this.eventRepository.find({
      where: { approvalStatus: ApprovalStatus.PENDING }, // On filtre sur le statut d'approbation
      order: { startDate: 'ASC' }, // On trie par date de début
      // relations: ['organizer'], // Décommenter si tu réactives la relation dans l'entité
    });
  }

  // 2. Approuver ou Rejeter un événement
  async updateEventStatus(id: string, updateEventStatusDto: UpdateEventStatusDto) {
    // Recherche par UUID
    const event = await this.eventRepository.findOne({ where: { id } });
    
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Mise à jour : on touche uniquement à approvalStatus
    event.approvalStatus = updateEventStatusDto.status;
    
    // Logique optionnelle : Si approuvé, on peut s'assurer que l'eventStatus est UPCOMING
    if (event.approvalStatus === ApprovalStatus.APPROVED) {
        event.eventStatus = EventStatus.UPCOMING;
    }

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
    
    // Compte uniquement ceux en attente de validation
    const pendingEvents = await this.eventRepository.count({
      where: { approvalStatus: ApprovalStatus.PENDING },
    });

    // Stats groupées par statut d'approbation
    const eventsByStatus = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.approvalStatus, COUNT(event.id) as count')
      .groupBy('event.approvalStatus')
      .getRawMany();

    return {
      overview: {
        totalUsers,
        totalEvents,
        pendingEvents,
      },
      details: {
        eventsByApprovalStatus: eventsByStatus,
      },
    };
  }
}