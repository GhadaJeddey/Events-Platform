import { Component, input } from '@angular/core';
import { Event } from '../../Models/Event';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../Commun/environments/environment';
import { HoverElevateDirective } from '../../directives/hover-elevate.directive';
import { StatusBadgeDirective } from '../../directives/status-badge.directive';

@Component({
  selector: 'app-event-card',
  imports: [DatePipe, RouterLink, HoverElevateDirective, StatusBadgeDirective],
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
