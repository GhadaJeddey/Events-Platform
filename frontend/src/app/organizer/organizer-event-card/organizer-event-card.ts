import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Event } from '../../Models/Event';

@Component({
  selector: 'app-organizer-event-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './organizer-event-card.html',
  styleUrl: './organizer-event-card.css'
})
export class OrganizerEventCard {
  event = input<Event>();

  getImageUrl(imageUrl?: string): string {
    if (!imageUrl) {
      return 'assets/images/default-event.jpg';
    }
    return imageUrl.startsWith('http') ? imageUrl : `http://localhost:3000${imageUrl}`;
  }
}
