import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventsService } from '../../services/events';
import { switchMap } from 'rxjs';
import { environment } from '../../../../Commun/environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { Event } from '../../Models/Event';
import { HoverElevateDirective } from '../../directives/hover-elevate.directive';
import { LoaderComponent } from '../../shared/components/loader/loader';
import { StatusBadgeDirective } from '../../directives/status-badge.directive';

@Component({
  selector: 'app-event-details',
  imports: [DatePipe, RouterLink, HoverElevateDirective, LoaderComponent, StatusBadgeDirective],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private route = inject(ActivatedRoute);
  private eventsService = inject(EventsService);


  event = toSignal(this.route.paramMap.pipe(
    switchMap(params => {
      const id = params.get('id');
      return this.eventsService.getEventById(id || '');
    })
  ));


  getFillPercentage(event: Event): number {
    return (event.currentRegistrations / event.capacity) * 100;
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return 'assets/images/default-event.png';
    return environment.apiUrl + imageUrl;
  }
}
