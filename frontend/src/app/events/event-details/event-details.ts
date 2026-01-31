import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
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
  private toastr = inject(ToastrService);

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
        this.isLoading.set(false);
      }
    });
  }

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

  registerForEvent() {
    // Vérifier si user est connecté
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.toastr.warning('Vous devez être connecté pour vous inscrire à un événement', 'Connexion requise');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Vérifier si user est étudiant
    if (currentUser.role !== 'student') {
      this.toastr.error('Seuls les étudiants peuvent s\'inscrire aux événements', 'Accès restreint');
      return;
    }

    const event = this.event();
    if (!event) return;

    this.isRegistering.set(true);

    this.registrationsService.register(event.id).subscribe({
      next: (response) => {
        this.isRegistering.set(false);
        if (event.currentRegistrations >= event.capacity) {
          this.toastr.info('Vous avez été ajouté à la liste d\'attente ! Vous serez notifié si une place se libère.', 'Liste d\'attente');
        } else {
          this.toastr.success('Inscription réussie ! Vous êtes désormais inscrit à l\'événement.', 'Succès');
        }
        // Mettre à jour l'état
        this.isUserRegistered.set(true);
        this.fetchEventData(); // Rafraîchir les données au lieu de naviguer ? Ou naviguer ?
        // On peut rester sur la page pour voir le changement ou naviguer vers le dashboard
        // this.router.navigate(['']); 
      },
      error: (error) => {
        this.isRegistering.set(false);
        console.error('Erreur lors de l\'inscription:', error);
        if (error.status === 409) {
          this.toastr.info('Vous êtes déjà inscrit à cet événement.', 'Information');
          this.isUserRegistered.set(true);
        } else if (error.status === 401) {
          this.toastr.warning('Votre session a expiré. Veuillez vous reconnecter.', 'Session expirée');
          this.router.navigate(['/auth/login']);
        } else {
          this.toastr.error(error.error?.message || 'Une erreur est survenue lors de l\'inscription', 'Erreur');
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
        this.toastr.success('Votre inscription a été annulée avec succès.', 'Annulation réussie');
        this.isUserRegistered.set(false);
        this.fetchEventData();
      },
      error: (error) => {
        this.isCancelling.set(false);
        this.toastr.error('Une erreur est survenue lors de l\'annulation de votre inscription', 'Erreur');
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
        this.isUserRegistered.set(false);
      }
    });
  }
}
