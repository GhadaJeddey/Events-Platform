import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventsService } from '../../services/events';
import { switchMap } from 'rxjs';
import { environment } from '../../../../Commun/environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { Event } from '../../Models/Event';

@Component({
  selector: 'app-event-details',
  imports: [DatePipe, RouterLink],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private route = inject(ActivatedRoute);
  private eventsService = inject(EventsService);

  // On récupère l'ID de la route et on demande l'événement au service
  event = toSignal(this.route.paramMap.pipe(
    switchMap(params => {
      const id = params.get('id');
      return this.eventsService.getEventById(id || '');
    })
  ));

  //personalisation du affichage du poucentage d'inscription
  getFillPercentage(event: Event): number {
    return (event.currentRegistrations / event.capacity) * 100;
  }

  //construire l'URL complète de l'image
  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    return environment.apiUrl + imageUrl;
  }
}
