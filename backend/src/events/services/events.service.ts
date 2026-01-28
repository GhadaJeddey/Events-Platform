import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan, Between, In, ILike, Or, And, Brackets } from 'typeorm';
import { Event } from '../entities/event.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { ApprovalStatus, EventStatus } from '../../common/enums/event.enums';
import { OrganizersService } from '../../organizers/services/organizers.service';
import { RegistrationsService } from '../../registrations/services/registrations.service';
import { ALL_ROOMS, RoomLocation } from 'src/common/enums/room-location.enum';
import { Registration } from '../../registrations/entities/registration.entity';
import { RegistrationStatus } from '../../common/enums/registration-status.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    private organizersService: OrganizersService,
    @Inject(forwardRef(() => RegistrationsService))
    private registrationsService: RegistrationsService,
  ) { }

  //  LOGIQUE DE DISPONIBILITÉ DES SALLES 

  /**
   * Retourne la liste des salles libres pour un créneau donné.
   * Une salle est exclue si un événement (PENDING ou APPROVED) occupe déjà ce créneau.
   */
  async getAvailableRooms(startStr: string, endStr: string): Promise<RoomLocation[]> {
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


  // CREATE 

  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);
    const now = new Date();

    // Validations de dates basiques
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
    console.log('🔍 findByOrganizerUser called with userId:', userId);
    const organizer = await this.organizersService.findOneByUserId(userId);
    console.log('👤 Found organizer:', organizer.id, organizer.name);
    const events = await this.eventsRepository.find({
      where: { organizer: { id: organizer.id } },
      relations: ['organizer'],
      order: { createdAt: 'DESC' },
    });
    console.log('📊 Found events count:', events.length);
    console.log('📋 Events:', events.map(e => ({ id: e.id, title: e.title, organizerId: (e as any).organizerId })));
    return events;
  }
  // UPDATE 

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.findOne(id); 
    const now = new Date();
    // On fusionne les nouvelles dates/lieux avec les anciennes si elles ne sont pas fournies
    const newStart = updateEventDto.startDate ? new Date(updateEventDto.startDate) : event.startDate;
    const newEnd = updateEventDto.endDate ? new Date(updateEventDto.endDate) : event.endDate;
    const newLocation = updateEventDto.location || event.location;

    // Si on modifie la date ou le lieu, on doit revérifier la disponibilité
    if (updateEventDto.startDate || updateEventDto.endDate || updateEventDto.location) {
        // on passe l'ID de l'événement actuel pour ne pas qu'il "entre en conflit avec lui-même"
        const isFree = await this.checkRoomAvailability(newLocation, newStart, newEnd, id);
        
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
    
    await this.eventsRepository.update(id, updateEventDto);
    return this.findOne(id);
  }
  
  // READ ALL PUBLIC
  async findAllPublic(): Promise<Event[]> {
    const now = new Date();
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

    const eventsToUpdate: Event[] = [];
    events.forEach((event) => {
      let changed = false;

      if (
        now >= new Date(event.startDate) &&
        now < new Date(event.endDate) &&
        event.eventStatus !== EventStatus.ONGOING
      ) {
        event.eventStatus = EventStatus.ONGOING;
        changed = true;
      }
      else if (
        now >= new Date(event.endDate) &&
        event.eventStatus !== EventStatus.COMPLETED
      ) {
        event.eventStatus = EventStatus.COMPLETED;
        changed = true;
      }

      if (changed) {
        eventsToUpdate.push(event);
      }
    });

    if (eventsToUpdate.length > 0) {
      for (const event of eventsToUpdate) {
        await this.eventsRepository.update(event.id, { 
          eventStatus: event.eventStatus 
        });
      }
    }
    return events.filter((e) => e.eventStatus !== EventStatus.COMPLETED);
  }

  // SEARCH 
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


  // DELETE
  async remove(id: string): Promise<void> {
    await this.eventsRepository.delete(id);
  }

  // Archiver automatiquement les événements passés
  async archivePastEvents(): Promise<void> {
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
  // Vérifier la capacité disponible
  async checkAvailability(eventId: string): Promise<number> {
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

  // Décrémenter le nombre d'inscriptions (annulation)
  async decrementRegistrations(eventId: string) {
    const event = await this.findOne(eventId);

    if (event.currentRegistrations > 0) {
      event.currentRegistrations -= 1;
    }
    this.eventsRepository.decrement({ id: eventId }, 'currentRegistrations', 1);
  }

  // Obtenir les événements d'un organisateur
  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return await this.eventsRepository.find({
      where: { organizer: { id: organizerId } },
      relations: ['organizer'],
      order: { startDate: 'DESC' },
    });
  }

  // Obtenir les statistiques d'un événement
  async getEventStatistics(eventId: string) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['registrations', 'registrations.student'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Compter les inscriptions par statut
    const confirmed = await this.registrationRepository.count({
      where: { 
        event: { id: eventId },
        status: RegistrationStatus.CONFIRMED 
      },
    });

    const waitlist = await this.registrationRepository.count({
      where: { 
        event: { id: eventId },
        status: RegistrationStatus.WAITLIST 
      },
    });

    const cancelled = await this.registrationRepository.count({
      where: { 
        event: { id: eventId },
        status: RegistrationStatus.CANCELLED 
      },
    });

    // Répartition par filière (confirmés uniquement)
    const majors = ['IIA', 'IMI', 'GL', 'RT'];
    const majorsRaw = await this.registrationRepository
      .createQueryBuilder('registration')
      .leftJoin('registration.student', 'student')
      .select('UPPER(student.major)', 'major')
      .addSelect('COUNT(*)', 'count')
      .where('registration.eventId = :eventId', { eventId })
      .andWhere('registration.status = :status', { status: RegistrationStatus.CONFIRMED })
      .groupBy('UPPER(student.major)')
      .getRawMany();

    const majorDistribution = majors.map((major) => {
      const entry = majorsRaw.find((m) => (m.major || '').toUpperCase() === major);
      return { major, count: entry ? Number(entry.count) : 0 };
    });

    // Inscriptions par jour (confirmés)
    const registrationsByDayRaw = await this.registrationRepository
      .createQueryBuilder('registration')
      .select('DATE(registration.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('registration.eventId = :eventId', { eventId })
      .andWhere('registration.status = :status', { status: RegistrationStatus.CONFIRMED })
      .groupBy('DATE(registration.createdAt)')
      .orderBy('DATE(registration.createdAt)', 'ASC')
      .getRawMany();

    const registrationsByDay = registrationsByDayRaw.map((row) => ({
      date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
      count: Number(row.count),
    }));

    // Inscriptions par heure (confirmés)
    const registrationsByHourRaw = await this.registrationRepository
      .createQueryBuilder('registration')
      .select('EXTRACT(HOUR FROM registration.createdAt)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('registration.eventId = :eventId', { eventId })
      .andWhere('registration.status = :status', { status: RegistrationStatus.CONFIRMED })
      .groupBy('EXTRACT(HOUR FROM registration.createdAt)')
      .orderBy('EXTRACT(HOUR FROM registration.createdAt)', 'ASC')
      .getRawMany();

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

}
