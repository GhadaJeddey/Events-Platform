/* import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/services/users.service';
import { StudentsService } from './students/services/students.service';
import { OrganizersService } from './organizers/services/organizers.service';
import { EventsService } from './events/services/events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './events/entities/event.entity';
import { Repository } from 'typeorm';
import { UserRole } from './common/enums/user.enums';
import { ApprovalStatus, EventStatus } from './common/enums/event.enums';
import { Registration } from './registrations/entities/registration.entity';
import { RegistrationStatus } from './common/enums/registration-status.enum';
import { Student } from './students/entities/student.entity';

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
      role: UserRole.ADMIN,
    },
    {
      firstName: 'Oscar',
      lastName: 'Organizer',
      email: 'oscar.organizer@example.com',
      password: 'Organizer@123',
      role: UserRole.ORGANIZER,
    },
    {
      firstName: 'Sam',
      lastName: 'Student',
      email: 'sam.student@example.com',
      password: 'Student@123',
      role: UserRole.STUDENT,
    },
    {
      firstName: 'Sara',
      lastName: 'Scholar',
      email: 'sara.scholar@example.com',
      password: 'Student@123',
      role: UserRole.STUDENT,
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
      location: 'Tech Hub, Building A, Room 101',
      capacity: 50,
      imageUrl: 'https://images.stockcake.com/public/2/e/e/2ee809d0-2c47-4406-9ed6-da53d72f0e0b_large/hackathon-event-buzz-stockcake.jpg',
    },
    {
      title: 'Web Development Bootcamp',
      description: 'Intensive bootcamp covering HTML, CSS, JS, and frameworks.',
      startDate: '2026-03-01T09:00:00Z',
      endDate: '2026-03-05T18:00:00Z',
      location: 'Innovation Center, Floor 3',
      capacity: 30,
      imageUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*5akpxEAq4fjVmd5pDtqDig.jpeg',
    },
    {
      title: 'Tech Meetup',
      description: 'Monthly meetup for tech enthusiasts to network and share.',
      startDate: '2026-04-10T18:00:00Z',
      endDate: '2026-04-10T21:00:00Z',
      location: 'Coffee & Code Café',
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
 */
/*
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventsService } from './events/services/events.service';
import { CreateEventDto } from './events/dto/create-event.dto';
import { UsersService } from './users/services/users.service'; // Vérifie le chemin
import { Role } from './common/enums/role.enum'; // Vérifie le chemin

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // 1. Récupération des services nécessaires
  const eventsService = app.get(EventsService);
  const usersService = app.get(UsersService);

  console.log('🌱 Début du seeding...');

  // ---------------------------------------------------------
  // ÉTAPE 1 : CRÉATION DES UTILISATEURS (ORGANISATEURS)
  // ---------------------------------------------------------
  console.log('👤 Création des utilisateurs...');

  // Ces IDs doivent correspondre exactement à ceux utilisés dans la boucle des événements plus bas
  const organizerIds = [
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000013',
  ];

  const users = [
    {
      id: organizerIds[0], // On force l'ID
      firstName: 'Alice',
      lastName: 'Admin',
      email: 'alice@admin.com',
      password: 'password123', // Pas de hashage demandé
      role: Role.ADMIN,
    },
    {
      id: organizerIds[1], // On force l'ID
      firstName: 'Bob',
      lastName: 'student',
      email: 'bob@school.com',
      password: 'password123',
      role: Role.STUDENT, // Assure-toi que ce rôle existe dans ton Enum
    },
    {
      id: organizerIds[2], // On force l'ID
      firstName: 'Charlie',
      lastName: 'Organizer',
      email: 'charlie@club.com',
      password: 'password123',
      role: Role.ORGANIZER,
    },
  ];

  for (const user of users) {
    try {
      // Attention: Il faut que ta méthode create accepte l'objet complet ou que tu passes par le repository si le DTO bloque l'ID
      await usersService.create(user as any);
      console.log(`✅ Utilisateur "${user.firstName}" créé (ID: ${user.id})`);
    } catch (error) {
      console.log(`⚠️ Info: Utilisateur "${user.email}" déjà existant ou erreur: ${error.message}`);
    }
  }

  console.log('------------------------------------------------');

  // ---------------------------------------------------------
  // ÉTAPE 2 : CRÉATION DES ÉVÉNEMENTS
  // ---------------------------------------------------------
  console.log('📅 Création des événements...');

  const events: CreateEventDto[] = [
    {
      title: 'Angular Workshop',
      description: 'Learn Angular from scratch with hands-on exercises and real-world examples.',
      startDate: '2026-02-15T10:00:00',
      endDate: '2026-02-15T16:00:00',
      location: 'Tech Hub, Building A, Room 101',
      capacity: 50,
      imageUrl: 'https://images.stockcake.com/public/2/e/e/2ee809d0-2c47-4406-9ed6-da53d72f0e0b_large/hackathon-event-buzz-stockcake.jpg',
    },
    {
      title: 'Web Development Bootcamp',
      description: 'Intensive bootcamp covering HTML, CSS, JavaScript, and modern frameworks.',
      startDate: '2026-03-01T09:00:00',
      endDate: '2026-03-05T18:00:00',
      location: 'Innovation Center, Floor 3',
      capacity: 30,
      imageUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*5akpxEAq4fjVmd5pDtqDig.jpeg',
    },
    {
      title: 'Tech Meetup',
      description: 'Monthly meetup for tech enthusiasts to network and share knowledge.',
      startDate: '2026-01-20T18:00:00',
      endDate: '2026-01-20T21:00:00',
      location: 'Coffee & Code Café',
      capacity: 100,
      imageUrl: 'https://i.ytimg.com/vi/0m0Jvcp76sE/maxresdefault.jpg',
    },
    {
      title: 'AI & ML Summit',
      description: 'Talks and demos on the latest in machine learning and AI.',
      startDate: '2026-04-05T09:30:00',
      endDate: '2026-04-05T17:00:00',
      location: 'Innovation Center, Auditorium',
      capacity: 200,
      imageUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6',
    },
    {
      title: 'Cloud Native Day',
      description: 'Kubernetes, containers, and cloud-native best practices.',
      startDate: '2026-04-20T10:00:00',
      endDate: '2026-04-20T18:00:00',
      location: 'Campus Center, Hall B',
      capacity: 120,
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    },
    {
      title: 'Design Systems Workshop',
      description: 'Build consistent UI libraries and tokens for large teams.',
      startDate: '2026-05-02T13:00:00',
      endDate: '2026-05-02T17:30:00',
      location: 'Design Lab, Room 204',
      capacity: 60,
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    },
    {
      title: 'Data Science Hackathon',
      description: '24h challenge around data cleaning, modeling, and visualization.',
      startDate: '2026-05-15T09:00:00',
      endDate: '2026-05-16T09:00:00',
      location: 'Library Innovation Space',
      capacity: 80,
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    },
    {
      title: 'Cybersecurity Capture the Flag',
      description: 'Hands-on CTF with web, crypto, and forensics tracks.',
      startDate: '2026-06-01T10:00:00',
      endDate: '2026-06-01T22:00:00',
      location: 'Security Lab',
      capacity: 70,
      imageUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87',
    },
    {
      title: 'Product Management Fundamentals',
      description: 'From discovery to delivery: roadmaps, KPIs, and stakeholder alignment.',
      startDate: '2026-06-10T14:00:00',
      endDate: '2026-06-10T18:00:00',
      location: 'Business School, Room 12',
      capacity: 90,
      imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7',
    },
    {
      title: 'VR/AR Demo Day',
      description: 'Showcase of immersive experiences and student projects.',
      startDate: '2026-07-05T11:00:00',
      endDate: '2026-07-05T17:00:00',
      location: 'Media Lab',
      capacity: 150,
      imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea',
    },
    {
      title: 'Green Tech Forum',
      description: 'Sustainability, clean energy, and climate tech innovations.',
      startDate: '2026-07-20T09:00:00',
      endDate: '2026-07-20T16:00:00',
      location: 'Conference Hall C',
      capacity: 180,
      imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6',
    },
  ];

  for (let i = 0; i < events.length; i++) {
    try {
      // On associe l'événement à un organisateur en répartissant la charge
      const organizerId = organizerIds[i % organizerIds.length];
      await eventsService.create(events[i], organizerId);
      console.log(`✅ Événement "${events[i].title}" créé avec succès`);
    } catch (error) {
      console.error(
        `❌ Erreur lors de la création de l'événement "${events[i].title}":`,
        error.message,
      );
    }
  }

  console.log('🎉 Seeding terminé !');
  await app.close();
}

bootstrap();
*/