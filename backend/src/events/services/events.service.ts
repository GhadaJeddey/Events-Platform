import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan, Between, In, ILike, Or, And, Brackets } from 'typeorm';
import { Event } from '../entities/event.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { ApprovalStatus, EventStatus } from '../../common/enums/event.enums';
import { OrganizersService } from '../../organizers/services/organizers.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    private organizersService: OrganizersService,
  ) { }

  // CREATE Event
  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);
    const now = new Date();

    if (startDate < now) {
      throw new BadRequestException(
        'La date de début ne peut pas être dans le passé',
      );
    }

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La date de fin doit être après la date de début',
      );
    }

    // ← Get the organizer profile from userId
    const organizer = await this.organizersService.findOneByUserId(userId);

    const event = this.eventsRepository.create({
      ...createEventDto,
      organizer: { id: organizer.id },  // ← Use organizer.id, not userId
      approvalStatus: ApprovalStatus.PENDING,
      eventStatus: EventStatus.UPCOMING,
      currentRegistrations: 0,
    });

    return await this.eventsRepository.save(event);
  }
  // READ ALL PUBLIC
  async findAllPublic(): Promise<Event[]> {
    return await this.eventsRepository.find({
      where: {
        approvalStatus: ApprovalStatus.APPROVED,
        eventStatus: In([EventStatus.UPCOMING, EventStatus.ONGOING]),
      },
      order: {
        startDate: 'ASC',
      },
    });
  }

  // SEARCH 
  async searchEvents(searchTerm: string): Promise<Event[]> {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    return await this.eventsRepository.createQueryBuilder('event')
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
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }

    return event;
  }

  // UPDATE
  async update(id: string, updateEventDto: UpdateEventDto) {
    const now = new Date();

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
      order: { startDate: 'DESC' },
    });
  }

}
