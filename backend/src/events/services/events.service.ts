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
import { RoomReservationRequest, ReservationStatus } from '../entities/room-reservation-request.entity';
import { CreateRoomReservationRequestDto } from '../dto/create-room-reservation-request.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(RoomReservationRequest)
    private roomReservationRequestRepository: Repository<RoomReservationRequest>,
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




  async getAvailableRooms(startStr: string, endStr: string): Promise<RoomLocation[]> {

    // verifie les salles dispo pour un créneau donné

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    console.log('🔍 [BACKEND] getAvailableRooms:', { startStr, endStr, startDate, endDate });

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Dates invalides');
    }

    // On cherche les réservations approuvées qui chevauchent ce créneau
    const conflictingReservations = await this.roomReservationRequestRepository
      .createQueryBuilder('reservation')
      .select('reservation.room')
      .where('reservation.status = :status', { status: ReservationStatus.APPROVED })
      .andWhere('reservation.startDate < :endDate', { endDate })
      .andWhere('reservation.endDate > :startDate', { startDate })
      .getMany();

    console.log('📋 [BACKEND] Réservations conflictuelles:', conflictingReservations);

    const occupiedRooms = conflictingReservations.map((r) => r.room);
    const availableRooms = ALL_ROOMS.filter((room) => !occupiedRooms.includes(room));
    
    console.log('✅ [BACKEND] Salles disponibles:', availableRooms);
    return availableRooms;
  }

  async getRoomSlots(room: string, startStr: string, endStr: string): Promise<any> {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    console.log('🔍 [BACKEND] getRoomSlots:', { room, startStr, endStr, startDate, endDate });

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Dates invalides');
    }

    // Récupérer les réservations approuvées pour cette salle dans la plage de dates
    const reservations = await this.roomReservationRequestRepository
      .createQueryBuilder('reservation')
      .where('reservation.room = :room', { room })
      .andWhere('reservation.status = :status', { status: ReservationStatus.APPROVED })
      .andWhere('reservation.startDate < :endDate', { endDate })
      .andWhere('reservation.endDate > :startDate', { startDate })
      .getMany();

    console.log('📋 [BACKEND] Réservations trouvées pour', room, ':', reservations);

    // Retourner les réservations avec leurs créneaux
    const result = reservations.map(reservation => ({
      id: reservation.id,
      title: reservation.eventTitle || 'Réservé',
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      approvalStatus: reservation.status
    }));
    
    console.log('✅ [BACKEND] Résultats getRoomSlots:', result);
    return result;
  }

  async checkRoomAvailability(
    location: RoomLocation,
    start: Date,
    end: Date,
    excludeReservationRequestId?: string
  ): Promise<boolean> {
    const query = this.roomReservationRequestRepository.createQueryBuilder('reservation')
      .where('reservation.room = :location', { location })
      .andWhere('reservation.status = :status', { status: ReservationStatus.APPROVED })
      .andWhere('reservation.startDate < :end', { end })
      .andWhere('reservation.endDate > :start', { start });

    if (excludeReservationRequestId) {
      query.andWhere('reservation.id != :id', { id: excludeReservationRequestId });
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
      const isFree = await this.checkRoomAvailability(newLocation, newStart, newEnd);
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
    const now = new Date();
    const events = await this.eventsRepository.find({
      where: {
        approvalStatus: In([ApprovalStatus.APPROVED, ApprovalStatus.CANCELLED]),
        eventStatus: In([EventStatus.UPCOMING, EventStatus.ONGOING]),
      },
      relations: ['organizer'],
      order: {
        startDate: 'ASC',
      },
    });

    const finalPublicEvents: Event[] = [];

    for (const event of events) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      let calculatedStatus = event.eventStatus;

      if (now >= endDate) {
        calculatedStatus = EventStatus.COMPLETED;
      } else if (now >= startDate) {
        calculatedStatus = EventStatus.ONGOING;
      } else {
        calculatedStatus = EventStatus.UPCOMING;
      }

      if (calculatedStatus !== event.eventStatus) {
        event.eventStatus = calculatedStatus;
        await this.eventsRepository.update(event.id, { eventStatus: calculatedStatus });
      }

      if (calculatedStatus !== EventStatus.COMPLETED) {
        finalPublicEvents.push(event);
      }
    }

    return finalPublicEvents;
  }

  async searchEvents(searchTerm: string): Promise<Event[]> {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const now = new Date();
    const events = await this.eventsRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .where('event.approvalStatus IN (:...appStatuses)', {
        appStatuses: [ApprovalStatus.APPROVED, ApprovalStatus.CANCELLED]
      })
      .andWhere('event.eventStatus IN (:...evtStatuses)', {
        evtStatuses: [EventStatus.UPCOMING, EventStatus.ONGOING],
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('event.title ILIKE :term', { term: `%${searchTerm}%` })
            .orWhere('event.description ILIKE :term', { term: `%${searchTerm}%` })
            .orWhere('CAST(event.location AS TEXT) ILIKE :term', { term: `%${searchTerm}%` });
        }),
      )
      .orderBy('event.startDate', 'ASC')
      .getMany();

    const finalResults: Event[] = [];

    for (const event of events) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      let calculatedStatus = event.eventStatus;

      if (now >= endDate) {
        calculatedStatus = EventStatus.COMPLETED;
      } else if (now >= startDate) {
        calculatedStatus = EventStatus.ONGOING;
      } else {
        calculatedStatus = EventStatus.UPCOMING;
      }

      if (calculatedStatus !== event.eventStatus) {
        event.eventStatus = calculatedStatus;
        await this.eventsRepository.update(event.id, { eventStatus: calculatedStatus });
      }

      // On ne retourne pas les évènements terminés dans la recherche publique
      if (calculatedStatus !== EventStatus.COMPLETED) {
        finalResults.push(event);
      }
    }

    return finalResults;
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer'],
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }

    // Mise à jour du statut en temps réel lors de la récupération d'un évènement spécifique
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    let calculatedStatus = event.eventStatus;

    if (now >= endDate) {
      calculatedStatus = EventStatus.COMPLETED;
    } else if (now >= startDate) {
      calculatedStatus = EventStatus.ONGOING;
    } else {
      calculatedStatus = EventStatus.UPCOMING;
    }

    if (calculatedStatus !== event.eventStatus) {
      event.eventStatus = calculatedStatus;
      await this.eventsRepository.update(event.id, { eventStatus: calculatedStatus });
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
      relations: ['registrations', 'registrations.student', 'organizer'],
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

    // Récupérer le statut de réservation de salle pour cet événement
    let roomBookingStatus: ReservationStatus | null = null;
    if (event.location && event.organizer) {
      const roomReservation = await this.roomReservationRequestRepository
        .createQueryBuilder('reservation')
        .where('reservation.organizerId = :organizerId', { organizerId: event.organizer.id })
        .andWhere('reservation.room = :room', { room: event.location })
        .andWhere('reservation.startDate = :startDate', { startDate: event.startDate })
        .andWhere('reservation.endDate = :endDate', { endDate: event.endDate })
        .orderBy('reservation.createdAt', 'DESC')
        .getOne();

      if (roomReservation) {
        roomBookingStatus = roomReservation.status;
      }
    }

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
      roomBookingStatus,
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

  // Room Reservation Requests Management
  async createRoomReservationRequest(
    createRoomReservationRequestDto: CreateRoomReservationRequestDto,
    userId: string
  ): Promise<RoomReservationRequest> {
    const startDate = new Date(createRoomReservationRequestDto.startDate);
    const endDate = new Date(createRoomReservationRequestDto.endDate);

    console.log('📥 [BACKEND] createRoomReservationRequest:', {
      dto: createRoomReservationRequestDto,
      userId,
      startDate,
      endDate
    });

    if (startDate >= endDate) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }

    const isFree = await this.checkRoomAvailability(
      createRoomReservationRequestDto.room,
      startDate,
      endDate
    );
    
    console.log(`${isFree ? '✅' : '❌'} [BACKEND] Disponibilité:`, isFree);
    
    if (!isFree) {
      throw new ConflictException(
        `La salle ${createRoomReservationRequestDto.room} n'est pas disponible pour ce créneau.`
      );
    }

    const organizer = await this.organizersService.findOneByUserId(userId);

    const reservationRequest = this.roomReservationRequestRepository.create({
      ...createRoomReservationRequestDto,
      organizer: { id: organizer.id },
      status: ReservationStatus.PENDING,
    });

    const saved = await this.roomReservationRequestRepository.save(reservationRequest);
    console.log('✅ [BACKEND] Réservation créée:', saved);
    return saved;
  }

  async getRoomReservationRequests(
    status?: ReservationStatus,
    room?: RoomLocation
  ): Promise<RoomReservationRequest[]> {
    const query = this.roomReservationRequestRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.organizer', 'organizer')
      .leftJoinAndSelect('organizer.user', 'user');

    if (status) {
      query.andWhere('reservation.status = :status', { status });
    }

    if (room) {
      query.andWhere('reservation.room = :room', { room });
    }

    return await query.orderBy('reservation.createdAt', 'DESC').getMany();
  }

  async approveRoomReservationRequest(requestId: string): Promise<RoomReservationRequest> {
    const reservationRequest = await this.roomReservationRequestRepository.findOne({
      where: { id: requestId },
      relations: ['organizer'],
    });

    if (!reservationRequest) {
      throw new NotFoundException('Demande de réservation non trouvée');
    }

    const isFree = await this.checkRoomAvailability(
      reservationRequest.room,
      reservationRequest.startDate,
      reservationRequest.endDate,
      reservationRequest.id
    );
    if (!isFree) {
      throw new ConflictException(
        `La salle ${reservationRequest.room} n'est pas disponible pour ce créneau.`
      );
    }

    reservationRequest.status = ReservationStatus.APPROVED;
    return await this.roomReservationRequestRepository.save(reservationRequest);
  }

  async rejectRoomReservationRequest(
    requestId: string,
    rejectionReason?: string
  ): Promise<RoomReservationRequest> {
    const reservationRequest = await this.roomReservationRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!reservationRequest) {
      throw new NotFoundException('Demande de réservation non trouvée');
    }

    reservationRequest.status = ReservationStatus.REJECTED;
    reservationRequest.rejectionReason = rejectionReason;
    return await this.roomReservationRequestRepository.save(reservationRequest);
  }

  async getPendingRoomReservationRequests(): Promise<RoomReservationRequest[]> {
    return await this.getRoomReservationRequests(ReservationStatus.PENDING);
  }

}
