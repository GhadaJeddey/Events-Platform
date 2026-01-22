import { Component, input } from '@angular/core';
import { Event } from '../../Models/Event';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../Commun/environments/environment';

@Component({
  selector: 'app-event-card',
  imports: [DatePipe, RouterLink],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
})
export class EventCard {
  event = input<Event>();

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return 'assets/images/default-event.png';
    return environment.apiUrl + imageUrl;
  }
}
