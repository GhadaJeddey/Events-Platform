import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventsService } from '../../services/events';
import { RegistrationsService } from '../../services/registrations';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../Commun/environments/environment';
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
  private router = inject(Router);
  private eventsService = inject(EventsService);
  private registrationsService = inject(RegistrationsService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);


  event = signal<Event | undefined>(undefined);

  constructor() {
    this.fetchEventData();
  }

  fetchEventData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.eventsService.getEventById(id).subscribe({
      next: (data) => this.event.set(data),
      error: (err) => {
        this.toastr.error('Impossible de charger les détails de l\'évènement');
      }
    });
  }

  onRegister() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const currentEvent = this.event();
    if (!currentEvent) return;

    this.registrationsService.register(currentEvent.id).subscribe({
      next: () => {
        this.toastr.success('Vous êtes maintenant inscrit à cet évènement !', 'Succès');

        this.fetchEventData();
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Une erreur est survenue lors de l\'inscription.';
        this.toastr.error(errorMessage, 'Erreur');
      }
    });
  }

  getFillPercentage(event: Event): number {
    return (event.currentRegistrations / event.capacity) * 100;
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return 'assets/images/default-event.png';
    return environment.apiUrl + imageUrl;
  }
}
