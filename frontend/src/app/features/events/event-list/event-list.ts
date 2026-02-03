import { Component, effect, inject, signal } from '@angular/core';
import { EventsService } from '../../../services/events';
import { EventCard } from '../event-card/event-card';
import { FormsModule } from '@angular/forms';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from '../../../shared/components/loader/loader';
import { SearchComponent } from '../../../shared/components/search/search';

@Component({
  selector: 'app-event-list',
  imports: [EventCard, FormsModule, LoaderComponent, SearchComponent],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList {
  private eventsService = inject(EventsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchQuery = toSignal(
    this.route.queryParams.pipe(
      map(params => params['q'] || '')
    ),
    { initialValue: '' }
  );

  events = toSignal(
    toObservable(this.searchQuery).pipe(
      switchMap(term => term.trim()
        ? this.eventsService.searchEvents(term)
        : this.eventsService.getEvents()
      )
    ),
    { initialValue: null }
  );

  onSearch(term: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: term || null },
    });
  }
}
