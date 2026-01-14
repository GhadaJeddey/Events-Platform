import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Event } from '../Models/Event';


@Injectable({
  providedIn: 'root',
})
export class EventsService {
  // Données de test
  private eventsData: Event[] = [
    {
      id: '1',
      title: 'Angular Workshop',
      description: 'Learn Angular from scratch with hands-on exercises and real-world examples.',
      startDate: '2026-02-15T10:00:00',
      endDate: '2026-02-15T16:00:00',
      location: 'Tech Hub, Building A, Room 101',
      capacity: 50,
      currentRegistrations: 23,
      imageUrl: 'https://images.stockcake.com/public/2/e/e/2ee809d0-2c47-4406-9ed6-da53d72f0e0b_large/hackathon-event-buzz-stockcake.jpg',
      approvalStatus: 'approved',
      eventStatus: 'upcoming',
      clubId: 'club-uuid-1',
      organizerId: 'user-uuid-1',
    },
    {
      id: '2',
      title: 'Web Development Bootcamp',
      description: 'Intensive bootcamp covering HTML, CSS, JavaScript, and modern frameworks.',
      startDate: '2026-03-01T09:00:00',
      endDate: '2026-03-05T18:00:00',
      location: 'Innovation Center, Floor 3',
      capacity: 30,
      currentRegistrations: 30,
      imageUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*5akpxEAq4fjVmd5pDtqDig.jpeg',
      approvalStatus: 'approved',
      eventStatus: 'upcoming',
      clubId: 'club-uuid-2',
      organizerId: 'user-uuid-2',
    },
    {
      id: '3',
      title: 'Tech Meetup',
      description: 'Monthly meetup for tech enthusiasts to network and share knowledge.',
      startDate: '2026-01-20T18:00:00',
      endDate: '2026-01-20T21:00:00',
      location: 'Coffee & Code Café',
      capacity: 100,
      currentRegistrations: 45,
      imageUrl: 'https://i.ytimg.com/vi/0m0Jvcp76sE/maxresdefault.jpg',
      approvalStatus: 'approved',
      eventStatus: 'upcoming',
      clubId: 'club-uuid-1',
      organizerId: 'user-uuid-3',
    },
  ];

  // BehaviorSubject pour gérer l'état des événements
  private eventsSubject = new BehaviorSubject<Event[]>(this.eventsData);

  // Observable public pour s'abonner
  public events$ = this.eventsSubject.asObservable();

  // Méthode pour récupérer les événements (retourne un Observable)
  getEvents(): Observable<Event[]> {
    return of(this.eventsData);
  }
  // Méthode pour récupérer un événement par ID
  getEventById(id: string): Observable<Event | undefined> {
    const event = this.eventsData.find(event => event.id === id);
    return of(event);
  }

}
