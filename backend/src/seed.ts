import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventsService } from './events/services/events.service';
import { randFutureDate, randPastDate, randCity, randNumber, randText, randUuid } from '@ngneat/falso';
import { CreateEventDto } from './events/dto/create-event.dto';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const eventsService = app.get(EventsService);


    const numberOfEvents = 10;

    for (let i = 0; i < numberOfEvents; i++) {
        const startDate = randFutureDate();
        const endDate = new Date(startDate.getTime() + 7200000); // +2 heures

        const eventDto: CreateEventDto = {
            title: randText({ charCount: 20 }),
            description: randText({ charCount: 100 }),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            location: randCity(),
            capacity: randNumber({ min: 10, max: 500 }),
            imageUrl: 'https://picsum.photos/200/300', // Image aléatoire
            clubId: randUuid(),
        };

        // On utilise un ID utilisateur fictif pour l'organisateur
        const fakeUserId = randUuid();

        try {
            await eventsService.create(eventDto, fakeUserId);
        } catch (error) {
            console.error('Erreur lors de la création de l\'événement:', error);
        }
    }
    await app.close();
}

bootstrap();
