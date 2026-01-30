import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  ConflictException
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, MoreThanOrEqual, LessThan, Between, In, ILike, Or, And, Brackets } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../entities/event.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { ApprovalStatus, EventStatus } from '../../common/enums/event.enums';
import { OrganizersService } from '../../organizers/services/organizers.service';
import { RegistrationsService } from '../../registrations/services/registrations.service';
import { ALL_ROOMS, RoomLocation } from 'src/common/enums/room-location.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    private organizersService: OrganizersService,
    @Inject(forwardRef(() => RegistrationsService))
    private registrationsService: RegistrationsService,
  ) { }

  private computeEventStatus(start: Date, end: Date, now: Date = new Date()): EventStatus {
    if (now >= start && now < end) {
      return EventStatus.ONGOING;
    }
    if (now >= end) {
      return EventStatus.COMPLETED;
    }
    return EventStatus.UPCOMING;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async refreshEventStatuses(): Promise<void> {

    // Met à jour le statut des événements chaque jour à minuit
    
    const now = new Date();
    const events = await this.eventsRepository.find({
      where: {
        eventStatus: In([EventStatus.UPCOMING, EventStatus.ONGOING]),
      },
    });

    if (events.length === 0) {
      return;
    }

    for (const event of events) {
      const computedStatus = this.computeEventStatus(
        new Date(event.startDate),
        new Date(event.endDate),
        now,
      );

      if (event.eventStatus !== computedStatus) {
        await this.eventsRepository.update(event.id, { eventStatus: computedStatus });
      }
    }
  }

  async getAvailableRooms(startStr: string, endStr: string): Promise<RoomLocation[]> {

    // verifie les salles dispo pour un créneau donné
    
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Dates invalides');
    }

    // On cherche les événements qui chevauchent ce créneau
    const conflictingEvents = await this.eventsRepository
      .createQueryBuilder('event')
      .select('event.location')
      .where('event.approvalStatus IN (:...statuses)', { 
          statuses: [ApprovalStatus.PENDING, ApprovalStatus.APPROVED] 
      })
      .andWhere('event.startDate < :endDate', { endDate }) 
      .andWhere('event.endDate > :startDate', { startDate }) 
      .getMany();

    const occupiedRooms = conflictingEvents.map((e) => e.location);
    return ALL_ROOMS.filter((room) => !occupiedRooms.includes(room));
  }

  async getRoomSlots(room: string, startStr: string, endStr: string): Promise<any> {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Dates invalides');
    }

    // Récupérer tous les événements approuvés ou en attente pour cette salle dans la plage de dates
    const events = await this.eventsRepository
      .createQueryBuilder('event')
      .where('event.location = :room', { room })
      .andWhere('event.approvalStatus IN (:...statuses)', { 
        statuses: [ApprovalStatus.PENDING, ApprovalStatus.APPROVED] 
      })
      .andWhere('event.startDate < :endDate', { endDate })
      .andWhere('event.endDate > :startDate', { startDate })
      .getMany();

    // Retourner les événements avec leurs créneaux
    return events.map(event => ({
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      approvalStatus: event.approvalStatus
    }));
  }

  async checkRoomAvailability(
    location: RoomLocation, 
    start: Date, 
    end: Date, 
    excludeEventId?: string
  ): Promise<boolean> {
    const query = this.eventsRepository.createQueryBuilder('event')
      .where('event.location = :location', { location })
      .andWhere('event.approvalStatus IN (:...statuses)', { statuses: [ApprovalStatus.PENDING, ApprovalStatus.APPROVED] })
      .andWhere('event.startDate < :end', { end })
      .andWhere('event.endDate > :start', { start });

    if (excludeEventId) {
      query.andWhere('event.id != :id', { id: excludeEventId });
    }

    const count = await query.getCount();
    return count === 0;
  }
 
  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {

    // créer un événement en s'assurant que la salle est dispo

    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);
    const now = new Date();

    if (startDate < now) throw new BadRequestException('La date de début ne peut pas être dans le passé');
    if (endDate <= startDate) throw new BadRequestException('La date de fin doit être après la date de début');

    // VÉRIFICATION DE LA SALLE 
    const isFree = await this.checkRoomAvailability(createEventDto.location, startDate, endDate);
    if (!isFree) {
      throw new ConflictException(`La salle ${createEventDto.location} est déjà réservée pour ce créneau.`);
    }

    const organizer = await this.organizersService.findOneByUserId(userId); 

    const event = this.eventsRepository.create({
      ...createEventDto,
      organizer: { id: organizer.id },  
      approvalStatus: ApprovalStatus.PENDING,
      eventStatus: EventStatus.UPCOMING,
      currentRegistrations: 0,
    });

    return await this.eventsRepository.save(event);
  }

  async findByOrganizerUser(userId: string): Promise<Event[]> {

    // Obtenir les événements pour l'organisateur connecté

    const organizer = await this.organizersService.findOneByUserId(userId);
    const events = await this.eventsRepository.find({
      where: { organizer: { id: organizer.id } },
      relations: ['organizer'],
      order: { createdAt: 'DESC' },
    });
    return events;
  }

  async update(idEvent: string, updateEventDto: UpdateEventDto) {
    const event = await this.findOne(idEvent); 
    const now = new Date();
    
    const newStart = updateEventDto.startDate ? new Date(updateEventDto.startDate) : event.startDate;
    const newEnd = updateEventDto.endDate ? new Date(updateEventDto.endDate) : event.endDate;
    const newLocation = updateEventDto.location || event.location;

    // Si on modifie la date ou le lieu, on doit revérifier la disponibilité de salle 
    if (updateEventDto.startDate || updateEventDto.endDate || updateEventDto.location) {
        const isFree = await this.checkRoomAvailability(newLocation, newStart, newEnd, idEvent);
        if (!isFree) {
            throw new ConflictException(`La salle ${newLocation} n'est pas disponible pour les nouvelles dates choisies.`);
        }
    }

    if (updateEventDto.startDate) {
      const startDate = new Date(updateEventDto.startDate);
      if (startDate < now) {
        throw new BadRequestException(
          'La date de début ne peut pas être dans le passé',
        );
      }
    }
    if (updateEventDto.startDate && updateEventDto.endDate) {
      const startDate = new Date(updateEventDto.startDate);
      const endDate = new Date(updateEventDto.endDate);
      if (endDate <= startDate) {
        throw new BadRequestException(
          'La date de fin doit être après la date de début',
        );
      }
    }
    // Recalculer le statut de l'événement en fonction des nouvelles dates
    const newEventStatus = this.computeEventStatus(newStart, newEnd, now);

    const updateData = {
      ...updateEventDto,
      ...(updateEventDto.startDate || updateEventDto.endDate ? { eventStatus: newEventStatus } : {})
    };
    
    const updatedEvent = await this.eventsRepository.preload({
      id: idEvent,
      ...updateData,
    });

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${idEvent} not found`);
    }

    return await this.eventsRepository.save(updatedEvent);
  }
  
  async findAllPublic(): Promise<Event[]> {
    const events = await this.eventsRepository.find({
      where: {
        approvalStatus: ApprovalStatus.APPROVED,
        eventStatus: In([EventStatus.UPCOMING, EventStatus.ONGOING]),
      },
      relations: ['organizer'],
      order: {
        startDate: 'ASC',
      },
    });
    return events;
  }

  async searchEvents(searchTerm: string): Promise<Event[]> {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    return await this.eventsRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .where('event.approvalStatus = :status', { status: ApprovalStatus.APPROVED })
      .andWhere('event.eventStatus IN (:...statuses)', {
        statuses: [EventStatus.UPCOMING, EventStatus.ONGOING],
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('event.title ILIKE :term', { term: `%${searchTerm}%` })
            .orWhere('event.description ILIKE :term', { term: `%${searchTerm}%` })
            .orWhere('event.location ILIKE :term', { term: `%${searchTerm}%` });
        }),
      )
      .orderBy('event.startDate', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer'],
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }

    return event;
  }

  async remove(id: string): Promise<void> {
    await this.eventsRepository.delete(id);
  }

  async archivePastEvents(): Promise<void> {
    // Archiver automatiquement les événements passés
    await this.eventsRepository.update(
      {
        endDate: LessThan(new Date()),
        eventStatus: EventStatus.UPCOMING,
      },
      {
        eventStatus: EventStatus.COMPLETED,
      },
    );
  }

  
  async checkAvailability(eventId: string): Promise<number> {
    // Vérifier la capacité disponible de places pour un événement
    const event = await this.findOne(eventId);
    return event.availableSpots;
  }

  async incrementRegistrations(eventId: string) {
    const event = await this.findOne(eventId);
    if (event.isFull) {
      throw new BadRequestException('Événement complet');
    }
    this.eventsRepository.increment({ id: eventId }, 'currentRegistrations', 1);
  }

  async decrementRegistrations(eventId: string) {
    const event = await this.findOne(eventId);

    if (event.currentRegistrations > 0) {
      event.currentRegistrations -= 1;
    }
    this.eventsRepository.decrement({ id: eventId }, 'currentRegistrations', 1);
  }

  async getEventStatistics(eventId: string) {
  
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['registrations', 'registrations.student'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Compter les inscriptions par statut
    const confirmed = await this.registrationsService.getConfirmedRegistrations(eventId);
    const waitlist = await this.registrationsService.getAwaitingRegistrations(eventId);
    const cancelled = await this.registrationsService.getCancelledRegistrations(Number(eventId));

    // Répartition par filière 
    const majors = ['IIA', 'IMI', 'GL', 'RT'];
    const majorsRaw = await this.registrationsService.getMajorDistribution(eventId);

    const majorDistribution = majors.map((major) => {
      const entry = majorsRaw.find((m) => (m.major || '').toUpperCase() === major);
      return { major, count: entry ? Number(entry.count) : 0 };
    });

    // Inscriptions par jour 
    const registrationsByDayRaw = await this.registrationsService.getRegistrationsByDay(eventId);

    const registrationsByDay = registrationsByDayRaw.map((row) => ({
      date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
      count: Number(row.count),
    }));

    // Inscriptions par heure
    const registrationsByHourRaw = await this.registrationsService.getRegistrationsByHour(eventId);

    const registrationsByHour = registrationsByHourRaw.map((row) => ({
      hour: Number(row.hour),
      count: Number(row.count),
    }));

    return {
      eventId: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      capacity: event.capacity,
      participants: confirmed,
      waitlist,
      cancelled,
      fillRate: event.capacity > 0 ? Math.round((confirmed / event.capacity) * 100) : 0,
      availableSpots: Math.max(0, event.capacity - confirmed),
      approvalStatus: event.approvalStatus,
      eventStatus: event.eventStatus,
      majorDistribution,
      registrationsByDay,
      registrationsByHour,
    };
  }

  // --- ADMIN METHODS ---

  async getPendingEvents(): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { approvalStatus: ApprovalStatus.PENDING },
      order: { startDate: 'ASC' },
      relations: ['organizer'],
    });
  }

  async updateApprovalStatus(id: string, status: ApprovalStatus): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    
    event.approvalStatus = status;
    return this.eventsRepository.save(event);
  }

  async getDashboardStats() {
    const totalEvents = await this.eventsRepository.count();
    const pendingEvents = await this.eventsRepository.count({
      where: { approvalStatus: ApprovalStatus.PENDING },
    });

    const eventsByStatus = await this.eventsRepository
      .createQueryBuilder('event')
      .select('event.approvalStatus', 'approvalStatus')
      .addSelect('COUNT(event.id)', 'count')
      .groupBy('event.approvalStatus')
      .getRawMany();

    const eventsByLocation = await this.eventsRepository
      .createQueryBuilder('event')
      .select('event.location', 'location')
      .addSelect('COUNT(event.id)', 'count')
      .groupBy('event.location')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      totalEvents,
      pendingEvents,
      eventsByStatus,
      eventsByLocation,
    };
  }

  async getRecentActivity(limit: number = 5): Promise<Event[]> {
    return this.eventsRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['organizer', 'organizer.user'],
    });
  }

}
