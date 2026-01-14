import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventsService } from '../../services/events';
import { Observable, switchMap } from 'rxjs';
import { Event } from '../../Models/Event';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, AsyncPipe, DatePipe, RouterLink],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private route = inject(ActivatedRoute);
  private eventsService = inject(EventsService);

  // On récupère l'ID de la route et on demande l'événement au service
  event$: Observable<Event | undefined> = this.route.paramMap.pipe(
    switchMap(params => {
      const id = params.get('id');
      return this.eventsService.getEventById(id || '');
    })
  );

  // Méthode pour personalisation du affichage du poucentage d'inscription
  getFillPercentage(event: Event): number {
    return (event.currentRegistrations / event.capacity) * 100;
  }
}
