import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/services/users.service';
import { StudentsService } from './students/services/students.service';
import { OrganizersService } from './organizers/services/organizers.service';
import { EventsService } from './events/services/events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './events/entities/event.entity';
import { Repository } from 'typeorm';
import { Role } from './common/enums/role.enum';
import { ApprovalStatus, EventStatus } from './common/enums/event.enums';
import { Registration } from './registrations/entities/registration.entity';
import { RegistrationStatus } from './common/enums/registration-status.enum';
import { Student } from './students/entities/student.entity';
import {RoomLocation} from './common/enums/room-location.enum';
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const studentsService = app.get(StudentsService);
  const organizersService = app.get(OrganizersService);
  const eventsService = app.get(EventsService);
  const eventRepository = app.get<Repository<Event>>(getRepositoryToken(Event));
  const registrationRepository = app.get<Repository<Registration>>(getRepositoryToken(Registration));
  const studentRepository = app.get<Repository<Student>>(getRepositoryToken(Student));

  console.log('🌱 Seeding sample data...');

  // --- Users ---
  const users = [
    {
      firstName: 'Alice',
      lastName: 'Admin',
      email: 'alice.admin@example.com',
      password: 'Admin@123',
      role: Role.ADMIN,
    },
    {
      firstName: 'Oscar',
      lastName: 'Organizer',
      email: 'oscar.organizer@example.com',
      password: 'Organizer@123',
      role: Role.ORGANIZER,
    },
    {
      firstName: 'Sam',
      lastName: 'Student',
      email: 'sam.student@example.com',
      password: 'Student@123',
      role: Role.STUDENT,
    },
    {
      firstName: 'Sara',
      lastName: 'Scholar',
      email: 'sara.scholar@example.com',
      password: 'Student@123',
      role: Role.STUDENT,
    },
  ];

  const createdUsers = {} as Record<string, any>;

  for (const user of users) {
    const existing = await usersService.findByEmail(user.email);
    if (existing) {
      console.log(`User ${user.email} already exists`);
      createdUsers[user.email] = existing;
      continue;
    }
    const newUser = await usersService.create(user as any);
    createdUsers[user.email] = newUser;
    console.log(`Created user ${user.email} with role ${user.role}`);
  }

  // --- Students profiles ---
  const studentProfiles = [
    {
      email: 'sam.student@example.com',
      studentCardNumber: 'STU-0001',
      major: 'Software Engineering',
    },
    {
      email: 'sara.scholar@example.com',
      studentCardNumber: 'STU-0002',
      major: 'Data Science',
    },
  ];

  for (const profile of studentProfiles) {
    const user = createdUsers[profile.email];
    if (!user) continue;

    try {
      const existingProfile = await studentsService.findOneByUserId(user.id);
      if (existingProfile) {
        console.log(`Student profile already exists for ${profile.email}`);
        continue;
      }
    } catch (err) {
      // Not found is expected when seeding
    }

    await studentsService.create(user, {
      studentCardNumber: profile.studentCardNumber,
      major: profile.major,
    });
    console.log(`Created student profile for ${profile.email}`);
  }

  // --- Organizer profile ---
  const organizerUser = createdUsers['oscar.organizer@example.com'];
  if (organizerUser) {
    try {
      await organizersService.findOneByUserId(organizerUser.id);
      console.log('Organizer profile already exists for oscar.organizer@example.com');
    } catch (err) {
      await organizersService.create(organizerUser, {
        name: 'Tech Club',
        description: 'Student-led tech club hosting meetups and workshops.',
        website: 'https://techclub.example.com',
      });
      console.log('Created organizer profile for oscar.organizer@example.com');
    }
  }

  // --- Events ---
  const events = [
    {
      title: 'Angular Workshop',
      description: 'Hands-on Angular workshop with live coding.',
      startDate: '2026-02-15T10:00:00Z',
      endDate: '2026-02-15T16:00:00Z',
      location: RoomLocation.AUDITORIUM,
      capacity: 50,
      imageUrl: 'https://images.stockcake.com/public/2/e/e/2ee809d0-2c47-4406-9ed6-da53d72f0e0b_large/hackathon-event-buzz-stockcake.jpg',
    },
    {
      title: 'Web Development Bootcamp',
      description: 'Intensive bootcamp covering HTML, CSS, JS, and frameworks.',
      startDate: '2026-03-01T09:00:00Z',
      endDate: '2026-03-05T18:00:00Z',
      location: RoomLocation.A1,
      capacity: 30,
      imageUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*5akpxEAq4fjVmd5pDtqDig.jpeg',
    },
    {
      title: 'Tech Meetup',
      description: 'Monthly meetup for tech enthusiasts to network and share.',
      startDate: '2026-04-10T18:00:00Z',
      endDate: '2026-04-10T21:00:00Z',
      location: RoomLocation.ORANGE,
      capacity: 100,
      imageUrl: 'https://i.ytimg.com/vi/0m0Jvcp76sE/maxresdefault.jpg',
    },
  ];

  const createdEvents = [] as Event[];

  if (organizerUser) {
    for (const eventData of events) {
      try {
        const event = await eventsService.create(eventData as any, organizerUser.id);
        await eventRepository.update(event.id, {
          approvalStatus: ApprovalStatus.APPROVED,
          eventStatus: EventStatus.UPCOMING,
        });
        const refreshed = await eventRepository.findOne({ where: { id: event.id } });
        if (refreshed) {
          createdEvents.push(refreshed);
        }
        console.log(`Created event ${eventData.title}`);
      } catch (error) {
        console.error(`Error creating event ${eventData.title}:`, error.message);
      }
    }
  }

  // --- Registrations ---
  const sam = await usersService.findByEmail('sam.student@example.com');
  const sara = await usersService.findByEmail('sara.scholar@example.com');

  const samStudent = sam ? await studentsService.findOneByUserId(sam.id) : null;
  const saraStudent = sara ? await studentsService.findOneByUserId(sara.id) : null;

  if (createdEvents.length && samStudent && saraStudent) {
    const targetEvents = createdEvents.slice(0, 2);

    for (const ev of targetEvents) {
      const existingSamReg = await registrationRepository.findOne({
        where: { student: { id: samStudent.id }, event: { id: ev.id } },
      });
      if (!existingSamReg) {
        await registrationRepository.save({
          student: samStudent,
          event: ev,
          status: RegistrationStatus.CONFIRMED,
        });
        await eventRepository.increment({ id: ev.id }, 'currentRegistrations', 1);
        console.log(`Registered Sam to ${ev.title}`);
      }

      const existingSaraReg = await registrationRepository.findOne({
        where: { student: { id: saraStudent.id }, event: { id: ev.id } },
      });
      if (!existingSaraReg) {
        await registrationRepository.save({
          student: saraStudent,
          event: ev,
          status: RegistrationStatus.CONFIRMED,
        });
        await eventRepository.increment({ id: ev.id }, 'currentRegistrations', 1);
        console.log(`Registered Sara to ${ev.title}`);
      }
    }
  }

  const studentCount = await studentRepository.count();
  const eventCount = await eventRepository.count();
  const registrationCount = await registrationRepository.count();
  console.log(
    `✅ Seed complete. Users: ${Object.keys(createdUsers).length}, Students: ${studentCount}, Events: ${eventCount}, Registrations: ${registrationCount}`,
  );

  await app.close();
}

bootstrap();



