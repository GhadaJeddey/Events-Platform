import { Component, input, output, inject, signal } from '@angular/core';
import { Event } from '../../Models/Event';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../Commun/environments/environment';
import { HoverElevateDirective } from '../../directives/hover-elevate.directive';
import { StatusBadgeDirective } from '../../directives/status-badge.directive';
import { RegistrationsService } from '../../services/registrations';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-event-card',
  imports: [DatePipe, CommonModule, RouterLink, HoverElevateDirective, StatusBadgeDirective],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
})
export class EventCard {
  private registrationsService = inject(RegistrationsService);
  private toastr = inject(ToastrService);
  
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
    
    this.registrationsService.getMyRegistrations().pipe(
      switchMap(registrations => {
        const registration = registrations.find(r => r.event.id === eventId);
        if (!registration) {
          throw new Error('Inscription non trouvée');
        }
        return this.registrationsService.cancel(registration.id);
      })
    ).subscribe({
      next: () => {
        this.isCancelling.set(false);
        this.toastr.success('Votre inscription a été annulée avec succès');
        this.registrationCancelled.emit();
      },
      error: (err) => {
        this.isCancelling.set(false);
        this.toastr.error('Erreur lors de l\'annulation de l\'inscription');
      }
    });
  }
}
