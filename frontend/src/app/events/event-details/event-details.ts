import { Component, inject, OnInit, effect } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventsService } from '../../services/events';
import { RegistrationsService } from '../../services/registrations';
import { AuthService } from '../../services/auth.service';
import { switchMap, of, EMPTY } from 'rxjs';
import { environment } from '../../../../Commun/environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { Event } from '../../Models/Event';
import { HoverElevateDirective } from '../../directives/hover-elevate.directive';
import { LoaderComponent } from '../../shared/components/loader/loader';
import { StatusBadgeDirective } from '../../directives/status-badge.directive';
import { signal, computed } from '@angular/core';

@Component({
  selector: 'app-event-details',
  imports: [DatePipe, CommonModule, RouterLink, HoverElevateDirective, LoaderComponent, StatusBadgeDirective],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventsService = inject(EventsService);
  private registrationsService = inject(RegistrationsService);
  private authService = inject(AuthService);

  isRegistering = signal(false);
  isCancelling = signal(false);
  isUserRegistered = signal(false);
  event = signal<Event | undefined>(undefined);
  isLoading = signal(true);

  ngOnInit() {
    // Se désabonner des changements de route et charger l'événement
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isLoading.set(true);
        this.isRegistering.set(false);
        this.isCancelling.set(false);
        this.checkIfUserIsRegistered(id);
        this.loadEvent(id);
      }
    });
  }

  loadEvent(id: string) {
    this.eventsService.getEventById(id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'événement:', err);
        this.isLoading.set(false);
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

  registerForEvent() {
    // Vérifier si user est connecté
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      alert('Vous devez être connecté pour vous inscrire à un événement');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Vérifier si user est étudiant
    if (currentUser.role !== 'student') {
      alert('Seuls les étudiants peuvent s\'inscrire aux événements');
      return;
    }

    const event = this.event();
    if (!event) return;

    this.isRegistering.set(true);

    this.registrationsService.register(event.id).subscribe({
      next: (response) => {
        this.isRegistering.set(false);
        if (event.currentRegistrations >= event.capacity) {
          alert('Vous avez été ajouté à la liste d\'attente ! Vous serez notifié si une place se libère.');
        } else {
          alert('Inscription réussie ! Vous êtes inscrit à l\'événement.');
        }
        // Mettre à jour l'état
        this.isUserRegistered.set(true);
        this.router.navigate(['']);
      },
      error: (error) => {
        this.isRegistering.set(false);
        console.error('Erreur lors de l\'inscription:', error);
        if (error.status === 409) {
          alert('Vous êtes déjà inscrit à cet événement');
          this.isUserRegistered.set(true);
        } else if (error.status === 401) {
          alert('Votre session a expiré. Veuillez vous reconnecter.');
          this.router.navigate(['/auth/login']);
        } else {
          alert(error.error?.message || 'Une erreur est survenue lors de l\'inscription');
        }
      }
    });
  }

  cancelRegistration() {
    const event = this.event();
    if (!event) return;

    if (!confirm('Êtes-vous sûr de vouloir annuler votre inscription ?')) {
      return;
    }

    this.isCancelling.set(true);

    this.registrationsService.cancel(event.id).subscribe({
      next: () => {
        this.isCancelling.set(false);
        alert('Votre inscription a été annulée.');
        this.isUserRegistered.set(false);
        this.router.navigate(['']);
      },
      error: (error) => {
        this.isCancelling.set(false);
        console.error('Erreur lors de l\'annulation:', error);
        alert('Une erreur est survenue lors de l\'annulation de votre inscription');
      }
    });
  }

  checkIfUserIsRegistered(eventId: string) {
    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.role !== 'student') {
      this.isUserRegistered.set(false);
      return;
    }

    this.registrationsService.getMyRegistrations().subscribe({
      next: (registrations) => {
        const isRegistered = registrations.some(reg => reg.event.id === eventId);
        this.isUserRegistered.set(isRegistered);
      },
      error: (err) => {
        console.error('Erreur lors de la vérification des inscriptions:', err);
        this.isUserRegistered.set(false);
      }
    });
  }
}
