import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRegistrationDto } from '../dto/create-registration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Registration } from '../entities/registration.entity';
import { Event } from '../../events/entities/event.entity';
import { RegistrationStatus } from '../../common/enums/registration-status.enum';
import { Student } from 'src/students/entities/student.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private dataSource: DataSource, // Utilisé pour les transactions
    private mailerService: MailerService,
  ) { }

  async create(createRegistrationDto: CreateRegistrationDto, userId: string) {
    const student = await this.studentRepository.findOne({ where: { user: { id: userId } }, relations: ['user'] });

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const event = await this.eventRepository.findOne({ where: { id: String(createRegistrationDto.eventId) } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const existingRegistration = await this.registrationRepository.findOne({
      where: { student: { id: student.id }, event: { id: event.id } },
    });

    if (existingRegistration) {
      throw new ConflictException('You have already registered for this event');
    }

    let status = RegistrationStatus.CONFIRMED;

    if (event.currentRegistrations >= event.capacity) {
      // user will be added to the waitlist
      status = RegistrationStatus.WAITLIST;
      await this.mailerService.sendMail({
        to: student.user.email,
        subject: `Your are added to the waitlist for: ${event.title}`,
        template: './waitlist-placement', // ou 'html:'
        context: {
          name: student.user.firstName,
          eventTitle: event.title,
        },
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newRegistration = this.registrationRepository.create({ student, event, status });
      await queryRunner.manager.save(newRegistration);

      if (status === RegistrationStatus.CONFIRMED) {
        event.currentRegistrations += 1;
        await queryRunner.manager.save(event);
      }

      await queryRunner.commitTransaction();
      try {
        if (status === RegistrationStatus.CONFIRMED) {
          await this.mailerService.sendMail({
            to: student.user.email,
            subject: `You are confirmed for: ${event.title}`,
            template: './confirmation',
            context: {
              name: student.user.firstName,
              eventTitle: event.title,
            },
          });
        }
        else {
          await this.mailerService.sendMail({
            to: student.user.email,
            subject: `Your are added to the waitlist for: ${event.title}`,
            template: './waitlist-placement',
            context: {
              name: student.user.firstName,
              eventTitle: event.title,
            },
          });
        }

      }catch (mailError) {
        console.error('Error sending email:', mailError);
      }
      
      return newRegistration;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

  }

  async findAll(userId: string) {
    // find all registrations for a specific user

    const student = await this.studentRepository.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!student) return [];

    return await this.registrationRepository.find({
      where: {
        student: { id: student.id },
        status: In([RegistrationStatus.CONFIRMED, RegistrationStatus.WAITLIST])
      },
      relations: ['event', 'event.organizer'], // Include event details and organizer
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
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ['event', 'student', 'student.user'],
    });

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
        await this.eventRepository.decrement({ id: event.id }, 'currentRegistrations', 1);

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
