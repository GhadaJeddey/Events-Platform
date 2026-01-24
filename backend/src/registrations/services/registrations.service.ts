import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRegistrationDto } from '../dto/create-registration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Registration } from '../entities/registration.entity';
import { Event } from '../../events/entities/event.entity';
import { RegistrationStatus } from '../../common/enums/registration-status.enum';
import { Student } from '../../students/entities/student.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { StudentsService } from '../../students/services/students.service';
import { EventsService } from '../../events/services/events.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    private studentsService: StudentsService,
    private eventsService: EventsService,
    private dataSource: DataSource, // Utilisé pour les transactions
    private mailerService: MailerService,
  ) { }

  async create(createRegistrationDto: CreateRegistrationDto, userId: string) {
    // 1. Récupération via les services (sécurisé et modulaire)
    const student = await this.studentsService.findOneByUserId(userId);
    const event = await this.eventsService.findOne(createRegistrationDto.eventId);

    if (!event) throw new NotFoundException('Event not found');

    // 2. Vérification doublon
    const existingRegistration = await this.registrationRepository.findOne({
      where: { 
        student: { id: student.id }, 
        event: { id: event.id } 
      },
    });

    if (existingRegistration) {
      throw new ConflictException('You have already registered for this event');
    }

    // 3. Détermination du statut
    let status = RegistrationStatus.CONFIRMED;
    if (event.currentRegistrations >= event.capacity) {
      status = RegistrationStatus.WAITLIST;
    }

    // 4. Transaction SQL (Atomicité)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Création de l'objet registration
      const newRegistration = this.registrationRepository.create({
        student,
        event,
        status,
      });

      // Sauvegarde de l'inscription
      await queryRunner.manager.save(newRegistration);

      // Si confirmé, on incrémente le compteur de l'event de manière atomique
      if (status === RegistrationStatus.CONFIRMED) {
        await queryRunner.manager.increment(Event, { id: event.id }, 'currentRegistrations', 1);
      }

      await queryRunner.commitTransaction(); // ✅ On valide tout en base

      // 5. Envoi des emails (APRES la transaction réussie)
      this.sendRegistrationEmail(student, event, status); // Async, on n'attend pas forcément

      return newRegistration;

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
      // On ne throw pas d'erreur ici pour ne pas annuler l'inscription si le mail échoue
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
    // find a specific registration by id for a specific user
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

    // cancel registration --> update its status 
    registration.status = RegistrationStatus.CANCELLED;
    await this.registrationRepository.save(registration);

    //Email de confirmation de l'annulation 
    await this.mailerService.sendMail({
      to: registration.student.user.email,
      subject: `Cancellation: ${registration.event.title}`,
      template: './cancellation',
      context: {
        name: registration.student.user.firstName,
        eventTitle: registration.event.title,
      },
    });

    // If registration was CONFIRMED --> handle waitlist
    const event = registration.event;
    if (previousStatus === RegistrationStatus.CONFIRMED) {
      const nextInLine = await this.registrationRepository.findOne({
        where: { event: { id: event.id }, status: RegistrationStatus.WAITLIST },
        order: { createdAt: 'ASC' }, // FIFO for waitlist
        relations: ['user']
      });

      if (nextInLine) {
        nextInLine.status = RegistrationStatus.CONFIRMED;
        await this.registrationRepository.save(nextInLine);
        console.log(`Promoted student ${nextInLine.student.id} from waitlist.`);
        await this.mailerService.sendMail({
          to: registration.student.user.email,
          subject: `Good News ! You are confirmed for : ${registration.event.title}`,
          template: './waitlist',
          context: {
            name: registration.student.user.firstName,
            eventTitle: registration.event.title,
          },
        });
      } else {
        await this.eventsService.decrementRegistrations(event.id);

      }
    }

    return { message: 'Registration cancelled successfully' };
  }

  // --- Method for analytics in clubs dashboard ---
  async getAwaitingRegistrations(eventId: string): Promise<number> {
    return await this.registrationRepository.count({
      where: {
        event: { id: String(eventId) },
        status: RegistrationStatus.WAITLIST
      }
    });
  }

  async getConfirmedRegistrations(eventId: string): Promise<number> {
    return await this.registrationRepository.count({
      where: {
        event: { id: String(eventId) },
        status: RegistrationStatus.CONFIRMED
      }
    });
  }

  async getCancelledRegistrations(eventId: number): Promise<number> {
    return await this.registrationRepository.count({
      where: {
        event: { id: String(eventId) },
        status: RegistrationStatus.CANCELLED
      }
    });
  }

}
