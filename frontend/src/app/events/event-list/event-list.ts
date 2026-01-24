import { Component, effect, inject, signal } from '@angular/core';
import { EventsService } from '../../services/events';
import { EventCard } from '../event-card/event-card';
import { FormsModule } from '@angular/forms';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-event-list',
  imports: [EventCard, FormsModule, LoaderComponent],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList {
  constructor() {
    effect(() => {
      this.searchTerm = this.searchQuery();
    });
  }

  private eventsService = inject(EventsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  searchQuery = toSignal(
    this.route.queryParams.pipe(
      map(params => params['q'] || '')
    ),
    { initialValue: '' }
  );
  searchTerm = '';

  events = toSignal(
    toObservable(this.searchQuery).pipe(
      switchMap(term => term.trim()
        ? this.eventsService.searchEvents(term)
        : this.eventsService.getEvents()
      )
    ),
    { initialValue: null }
  );

  onSearch() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.searchTerm || null },
    });
  }
}
