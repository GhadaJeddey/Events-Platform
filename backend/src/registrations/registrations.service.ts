import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Registration } from './entities/registration.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { RegistrationStatus } from '../common/enums/registration-status.enum';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createRegistrationDto: CreateRegistrationDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const event = await this.eventRepository.findOne({ where: { id: String(createRegistrationDto.eventId) } });

    if (!user || !event) {
      throw new NotFoundException('User or Event not found');
    }

    if (event.currentRegistrations >= event.capacity) {
      // user will be added to the waitlist
      const waitlistRegistration = this.registrationRepository.create({
        user,
        event,
        status: 'waitlist', 
      });
      return await this.registrationRepository.save(waitlistRegistration);
    }

    const registration = this.registrationRepository.create({ user, event });
    event.currentRegistrations += 1;
    await this.eventRepository.save(event);

    return await this.registrationRepository.save(registration);

  }

  async findAll(userId: number) {
    // find all registrations for a specific user
      return await this.registrationRepository.find({
        where: { 
          user: { id: userId },
          status: In([RegistrationStatus.CONFIRMED, RegistrationStatus.WAITLIST])
        },
        relations: ['event'], // Include event details
        order: { createdAt: 'DESC' }
      });
    }

  async findOne(id: number, userId: number) {
    // find a specific registration by id for a specific user
      const registration = await this.registrationRepository.findOne({
        where: { id },
        relations: ['event', 'user'],
      });

      if (!registration) {
        throw new NotFoundException(`Registration #${id} not found`);
      }

      // Security
      if (registration.user.id !== userId) {
        throw new ForbiddenException('You can only view your own registrations');
      }

      return registration;
    }

  async cancelRegistration(id: number, userId: number) {
      const registration = await this.registrationRepository.findOne({
        where: { id },
        relations: ['event', 'user'],
      });

      if (!registration) throw new NotFoundException('Registration not found');
      
      // Security
      if (registration.user.id !== userId) {
        throw new ForbiddenException('You cannot cancel someone else\'s registration');
      }
      registration.status == RegistrationStatus.CANCELLED;
      await this.registrationRepository.save(registration);

      const event = registration.event;

      if (registration.status === RegistrationStatus.CONFIRMED) {
      
        const nextInLine = await this.registrationRepository.findOne({
          where: { event: { id: event.id }, status: RegistrationStatus.WAITLIST },
          order: { createdAt: 'ASC' }, // FIFO for waitlist
          relations: ['user'] 
        });

        if (nextInLine) {
          nextInLine.status = RegistrationStatus.CONFIRMED;
          await this.registrationRepository.save(nextInLine);
          console.log(`Promoted user ${nextInLine.user.id} from waitlist.`);
        } else {
          event.currentRegistrations -= 1;
          await this.eventRepository.save(event);
        }
      }

      return { message: 'Registration cancelled successfully', id };
    }

  async getAwaitingRegistrations(eventId: number) : Promise<number>{
    return await this.registrationRepository.count({
      where: {
        event: { id: String(eventId) },
        status: RegistrationStatus.WAITLIST
      }
    });
  }
  
  async getConfirmedRegistrations(eventId: number) : Promise<number>{
    return await this.registrationRepository.count({
      where: {
        event: { id: String(eventId) },
        status: RegistrationStatus.CONFIRMED
      }
    });
  }

  async getCancelledRegistrations(eventId: number) : Promise<number>{
      return await this.registrationRepository.count({
        where: {
          event: { id: String(eventId) },
          status: RegistrationStatus.CANCELLED
        }
      });
    }

}
