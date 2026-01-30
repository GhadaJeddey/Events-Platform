import { Component, input, output, inject, signal } from '@angular/core';
import { Event } from '../../Models/Event';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../Commun/environments/environment';
import { HoverElevateDirective } from '../../directives/hover-elevate.directive';
import { StatusBadgeDirective } from '../../directives/status-badge.directive';
import { RegistrationsService } from '../../services/registrations';

@Component({
  selector: 'app-event-card',
  imports: [DatePipe, CommonModule, RouterLink, HoverElevateDirective, StatusBadgeDirective],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
})
export class EventCard {
  private registrationsService = inject(RegistrationsService);
  
  event = input<Event>();
  isRegistered = input<boolean>();
  mode = input<'student' | 'organizer'>('student');
  registrationCancelled = output<void>();
  isCancelling = signal<boolean>(false);

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return 'assets/images/default-event.png';
    return environment.apiUrl + imageUrl;
  }

  cancelRegistration() {
    const eventId = this.event()?.id;
    if (!eventId) return;

    this.isCancelling.set(true);
    this.registrationsService.cancel(eventId).subscribe({
      next: () => {
        this.isCancelling.set(false);
        this.registrationCancelled.emit();
      },
      error: (err) => {
        console.error('Erreur lors de l\'annulation', err);
        this.isCancelling.set(false);
      }
    });
  }
}
