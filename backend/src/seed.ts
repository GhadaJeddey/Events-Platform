import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventsService } from './events/services/events.service';
import { CreateEventDto } from './events/dto/create-event.dto';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const eventsService = app.get(EventsService);

    console.log(' Début du seeding des événements...');

    // Les 3 événements du service frontend
    const events: CreateEventDto[] = [
        {
            title: 'Angular Workshop',
            description: 'Learn Angular from scratch with hands-on exercises and real-world examples.',
            startDate: '2026-02-15T10:00:00',
            endDate: '2026-02-15T16:00:00',
            location: 'Tech Hub, Building A, Room 101',
            capacity: 50,
            imageUrl: 'https://images.stockcake.com/public/2/e/e/2ee809d0-2c47-4406-9ed6-da53d72f0e0b_large/hackathon-event-buzz-stockcake.jpg',
            clubId: 'club-uuid-1',
        },
        {
            title: 'Web Development Bootcamp',
            description: 'Intensive bootcamp covering HTML, CSS, JavaScript, and modern frameworks.',
            startDate: '2026-03-01T09:00:00',
            endDate: '2026-03-05T18:00:00',
            location: 'Innovation Center, Floor 3',
            capacity: 30,
            imageUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*5akpxEAq4fjVmd5pDtqDig.jpeg',
            clubId: 'club-uuid-2',
        },
        {
            title: 'Tech Meetup',
            description: 'Monthly meetup for tech enthusiasts to network and share knowledge.',
            startDate: '2026-01-20T18:00:00',
            endDate: '2026-01-20T21:00:00',
            location: 'Coffee & Code Café',
            capacity: 100,
            imageUrl: 'https://i.ytimg.com/vi/0m0Jvcp76sE/maxresdefault.jpg',
            clubId: 'club-uuid-1',
        },
    ];

    // IDs des organisateurs correspondants
    const organizerIds = ['user-uuid-1', 'user-uuid-2', 'user-uuid-3'];

    for (let i = 0; i < events.length; i++) {
        try {
            await eventsService.create(events[i], organizerIds[i]);
            console.log(` Événement "${events[i].title}" créé avec succès`);
        } catch (error) {
            console.error(` Erreur lors de la création de l'événement "${events[i].title}":`, error.message);
        }
    }

    console.log(' Seeding terminé !');
    await app.close();
}

bootstrap();

