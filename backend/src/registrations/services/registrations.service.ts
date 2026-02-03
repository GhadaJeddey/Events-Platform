import { ConflictException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRegistrationDto } from '../dto/create-registration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Registration } from '../entities/registration.entity';
import { Event } from '../../events/entities/event.entity';
import { RegistrationStatus } from '../../common/enums/registration-status.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { StudentsService } from '../../students/services/students.service';
import { EventsService } from '../../events/services/events.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    private studentsService: StudentsService,
    @Inject(forwardRef(() => EventsService))
    private eventsService: EventsService,
    private dataSource: DataSource, // Utilisé pour les transactions
    private mailerService: MailerService,
  ) { }

  async create(createRegistrationDto: CreateRegistrationDto, userId: string) {
    const student = await this.studentsService.findOneByUserId(userId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // lock l'événement pour empêcher d'autres écritures simultanées
      const event = await queryRunner.manager.findOne(Event, {
        where: { id: createRegistrationDto.eventId },
        lock: { mode: 'pessimistic_write' } // reserver la ligne de l'événement pour ta transaction en cours
      });

      if (!event) throw new NotFoundException('Event not found');

      // 2. Vérifier si une inscription existe déjà (y compris annulée)
      let registration = await queryRunner.manager.findOne(Registration, {
        where: { student: { id: student.id }, event: { id: event.id } }
      });

      let status = RegistrationStatus.CONFIRMED;
      if (event.currentRegistrations >= event.capacity) {
        status = RegistrationStatus.WAITLIST;
      }

      if (registration) {
        if (registration.status !== RegistrationStatus.CANCELLED) {
          throw new ConflictException('Déjà inscrit');
        }
        // Réactivation d'une inscription annulée
        registration.status = status;
      } else {
        // Nouvelle inscription
        registration = this.registrationRepository.create({ student, event, status });
      }

      await queryRunner.manager.save(registration);

      if (status === RegistrationStatus.CONFIRMED) {
        event.currentRegistrations += 1;
        await queryRunner.manager.save(event);
      }

      await queryRunner.commitTransaction();

      this.sendRegistrationEmail(student, event, status);
      return registration;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async sendRegistrationEmail(student: any, event: any, status: RegistrationStatus) {
    try {
      const template = status === RegistrationStatus.CONFIRMED ? './confirmation' : './waitlist-placement';
      const subject = status === RegistrationStatus.CONFIRMED
        ? `You are confirmed for: ${event.title}`
        : `You are added to the waitlist for: ${event.title}`;

      await this.mailerService.sendMail({
        to: student.user.email,
        subject,
        template,
        context: {
          name: student.user.firstName,
          eventTitle: event.title,
        },
      });
    } catch (e) {
      console.error('Error sending email:', e);
    }
  }

  async findAll(userId: string) {
    const student = await this.studentsService.findOneByUserId(userId);

    return await this.registrationRepository.find({
      where: {
        student: { id: student.id },
        status: In([RegistrationStatus.CONFIRMED, RegistrationStatus.WAITLIST])
      },
      relations: ['event', 'event.organizer'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string, userId: string) {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ['event', 'student', 'student.user'],
    });

    if (!registration) {
      throw new NotFoundException(`Registration #${id} not found`);
    }

    // Security
    if (registration.student.user.id !== userId) {
      throw new ForbiddenException('You can only view your own registrations');
    }

    return registration;
  }

  async cancelRegistration(id: string, userId: string) {
    const registration = await this.findOne(id, userId);

    if (!registration) throw new NotFoundException('Registration not found');

    // Security
    if (registration.student.user.id !== userId) {
      throw new ForbiddenException('You cannot cancel someone else\'s registration');
    }

    const previousStatus = registration.status
    if (previousStatus === RegistrationStatus.CANCELLED) {
      return { message: 'Registration already cancelled', id };
    }

    const event = registration.event;

    // If registration was CONFIRMED --> handle waitlist and decrement count
    if (previousStatus === RegistrationStatus.CONFIRMED) {
      const nextInLine = await this.registrationRepository.findOne({
        where: { event: { id: event.id }, status: RegistrationStatus.WAITLIST },
        order: { createdAt: 'ASC' }, // FIFO for waitlist
        relations: ['student', 'student.user']
      });

      if (nextInLine) {
        nextInLine.status = RegistrationStatus.CONFIRMED;
        await this.registrationRepository.save(nextInLine);
        console.log(`Promoted student ${nextInLine.student.id} from waitlist.`);
        await this.mailerService.sendMail({
          to: nextInLine.student.user.email,
          subject: `Good News ! You are confirmed for : ${registration.event.title}`,
          template: './waitlist',
          context: {
            name: nextInLine.student.user.firstName,
            eventTitle: registration.event.title,
          },
        });
      } else {
        await this.eventsService.decrementRegistrations(event.id);
      }
    }

    // Marquer l'inscription comme CANCELLED au lieu de la supprimer physiquement
    registration.status = RegistrationStatus.CANCELLED;
    await this.registrationRepository.save(registration);

    // Email de confirmation de l'annulation 
    await this.mailerService.sendMail({
      to: registration.student.user.email,
      subject: `Cancellation: ${registration.event.title}`,
      template: './cancellation',
      context: {
        name: registration.student.user.firstName,
        eventTitle: registration.event.title,
      },
    });

    return { message: 'Registration cancelled successfully' };
  }

  // --- Analytics in clubs dashboard ---
  async getAwaitingRegistrations(eventId: string): Promise<number> {
    const result = await this.registrationRepository
      .createQueryBuilder('registration')
      .where('registration.eventId = :eventId', { eventId })
      .andWhere('registration.status = :status', { status: RegistrationStatus.WAITLIST })
      .getCount();
    return result;
  }

  async getConfirmedRegistrations(eventId: string): Promise<number> {
    const result = await this.registrationRepository
      .createQueryBuilder('registration')
      .where('registration.eventId = :eventId', { eventId })
      .andWhere('registration.status = :status', { status: RegistrationStatus.CONFIRMED })
      .getCount();
    return result;
  }

  async getCancelledRegistrations(eventId: string): Promise<number> {
    const result = await this.registrationRepository
      .createQueryBuilder('registration')
      .where('registration.eventId = :eventId', { eventId })
      .andWhere('registration.status = :status', { status: RegistrationStatus.CANCELLED })
      .getCount();
    return result;
  }

  async getMajorDistribution(eventId: string) {
    const majorsRaw = await this.registrationRepository
      .createQueryBuilder('registration')
      .leftJoin('registration.student', 'student')
      .select('UPPER(student.major)', 'major')
      .addSelect('COUNT(*)', 'count')
      .where('registration.eventId = :eventId', { eventId })
      .andWhere('registration.status = :status', { status: RegistrationStatus.CONFIRMED })
      .groupBy('UPPER(student.major)')
      .getRawMany();

    return majorsRaw;
  }

  async getRegistrationsByDay(eventId: string) {
    try {

      const registrationsByDayRaw = await this.registrationRepository
        .createQueryBuilder('registration')
        .select('DATE(registration.createdAt)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('registration.eventId = :eventId', { eventId })
        .andWhere('registration.status = :status', { status: RegistrationStatus.CONFIRMED })
        .groupBy('DATE(registration.createdAt)')
        .orderBy('DATE(registration.createdAt)', 'ASC')
        .getRawMany();


      return registrationsByDayRaw;
    } catch (error) {

      throw error;
    }
  }

  async getRegistrationsByHour(eventId: string) {
    try {
      const registrationsByHourRaw = await this.registrationRepository
        .createQueryBuilder('registration')
        .select('EXTRACT(HOUR FROM registration.createdAt)', 'hour')
        .addSelect('COUNT(*)', 'count')
        .where('registration.eventId = :eventId', { eventId })
        .andWhere('registration.status = :status', { status: RegistrationStatus.CONFIRMED })
        .groupBy('EXTRACT(HOUR FROM registration.createdAt)')
        .orderBy('EXTRACT(HOUR FROM registration.createdAt)', 'ASC')
        .getRawMany();
        
      return registrationsByHourRaw;
    } catch (error) {

      throw error;
    }
  }

  // --- FOR ORGANIZERS ---

  async getEventRegistrations(eventId: string) {
    return await this.registrationRepository.find({
      where: {
        event: { id: eventId },
        status: In([RegistrationStatus.CONFIRMED, RegistrationStatus.WAITLIST])
      },
      relations: ['student', 'student.user'],
      order: { createdAt: 'ASC' }
    });
  }

}
