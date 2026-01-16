import { Component, inject } from '@angular/core';
import { EventsService } from '../../services/events';
import { Event } from '../../Models/Event';
import { Observable } from 'rxjs';
import { EventCard } from '../event-card/event-card';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-event-list',
  imports: [EventCard, AsyncPipe],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList {
  private eventsService = inject(EventsService);

  events$: Observable<Event[]> = this.eventsService.getEvents();
}
