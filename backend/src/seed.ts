/* import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventsService } from './events/services/events.service';
import { CreateEventDto } from './events/dto/create-event.dto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const eventsService = app.get(EventsService);

  console.log(' Début du seeding des événements...');

  // on cree des evenements pour tester
  const events: CreateEventDto[] = [
    {
      title: 'Angular Workshop',
      description:
        'Learn Angular from scratch with hands-on exercises and real-world examples.',
      startDate: '2026-02-15T10:00:00',
      endDate: '2026-02-15T16:00:00',
      location: 'Tech Hub, Building A, Room 101',
      capacity: 50,
      imageUrl:
        'https://images.stockcake.com/public/2/e/e/2ee809d0-2c47-4406-9ed6-da53d72f0e0b_large/hackathon-event-buzz-stockcake.jpg',
      clubId: '00000000-0000-0000-0000-000000000001',
    },
    {
      title: 'Web Development Bootcamp',
      description:
        'Intensive bootcamp covering HTML, CSS, JavaScript, and modern frameworks.',
      startDate: '2026-03-01T09:00:00',
      endDate: '2026-03-05T18:00:00',
      location: 'Innovation Center, Floor 3',
      capacity: 30,
      imageUrl:
        'https://miro.medium.com/v2/resize:fit:1200/1*5akpxEAq4fjVmd5pDtqDig.jpeg',
      clubId: '00000000-0000-0000-0000-000000000002',
    },
    {
      title: 'Tech Meetup',
      description:
        'Monthly meetup for tech enthusiasts to network and share knowledge.',
      startDate: '2026-01-20T18:00:00',
      endDate: '2026-01-20T21:00:00',
      location: 'Coffee & Code Café',
      capacity: 100,
      imageUrl: 'https://i.ytimg.com/vi/0m0Jvcp76sE/maxresdefault.jpg',
      clubId: '00000000-0000-0000-0000-000000000001',
    },
  ];

  // IDs des organisateurs correspondants
  const organizerIds = [
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000013',
  ];

  for (let i = 0; i < events.length; i++) {
    try {
      await eventsService.create(events[i], organizerIds[i]);
      console.log(` Événement "${events[i].title}" créé avec succès`);
    } catch (error) {
      console.error(
        ` Erreur lors de la création de l'événement "${events[i].title}":`,
        error.message,
      );
    }
  }

  console.log(' Seeding terminé !');
  await app.close();
}

bootstrap();
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventsService } from './events/services/events.service';
import { CreateEventDto } from './events/dto/create-event.dto';
import { UsersService } from './users/services/users.service'; // Vérifie le chemin
import { UserRole } from './common/enums/user.enums'; // Vérifie le chemin

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
      role: UserRole.ADMIN,
    },
    {
      id: organizerIds[1], // On force l'ID
      firstName: 'Bob',
      lastName: 'student',
      email: 'bob@school.com',
      password: 'password123',
      role: UserRole.STUDENT, // Assure-toi que ce rôle existe dans ton Enum
    },
    {
      id: organizerIds[2], // On force l'ID
      firstName: 'Charlie',
      lastName: 'Organizer',
      email: 'charlie@club.com',
      password: 'password123',
      role: UserRole.ORGANIZER,
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
      clubId: '00000000-0000-0000-0000-000000000001',
    },
    {
      title: 'Web Development Bootcamp',
      description: 'Intensive bootcamp covering HTML, CSS, JavaScript, and modern frameworks.',
      startDate: '2026-03-01T09:00:00',
      endDate: '2026-03-05T18:00:00',
      location: 'Innovation Center, Floor 3',
      capacity: 30,
      imageUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*5akpxEAq4fjVmd5pDtqDig.jpeg',
      clubId: '00000000-0000-0000-0000-000000000002',
    },
    {
      title: 'Tech Meetup',
      description: 'Monthly meetup for tech enthusiasts to network and share knowledge.',
      startDate: '2026-01-20T18:00:00',
      endDate: '2026-01-20T21:00:00',
      location: 'Coffee & Code Café',
      capacity: 100,
      imageUrl: 'https://i.ytimg.com/vi/0m0Jvcp76sE/maxresdefault.jpg',
      clubId: '00000000-0000-0000-0000-000000000001',
    },
  ];

  for (let i = 0; i < events.length; i++) {
    try {
      // On associe l'événement à l'ID de l'organisateur (User) créé juste avant
      await eventsService.create(events[i], organizerIds[i]);
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