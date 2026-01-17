import { Component, inject } from '@angular/core';
import { EventsService } from '../../services/events';
import { EventCard } from '../event-card/event-card';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-event-list',
  imports: [EventCard],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList {
  private eventsService = inject(EventsService);

  events = toSignal(this.eventsService.getEvents(), { initialValue: [] });
}
