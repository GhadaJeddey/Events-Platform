import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventsService } from '../../../services/events';
import { RegistrationsService } from '../../../services/registrations';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../shared/environments/environment';
import { Event } from '../../../shared/models/Event';
import { HoverElevateDirective } from '../../../shared/directives/hover-elevate.directive';
import { LoaderComponent } from '../../../shared/components/loader/loader';
import { StatusBadgeDirective } from '../../../shared/directives/status-badge.directive';
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
  public authService = inject(AuthService);
  private toastr = inject(ToastrService);

  isRegistering = signal(false);
  isCancelling = signal(false);
  isUserRegistered = signal(false);
  currentRegistrationId = signal<string | null>(null);
  showCancelConfirmDialog = signal(false);
  event = signal<Event | undefined>(undefined);
  isLoading = signal(true);
  isStudent = computed(() => this.authService.currentUser()?.role === 'student');
  isOrganizer = computed(() => this.authService.currentUser()?.role === 'organizer');
  isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');

  ngOnInit() {
    // Se désabonner des changements de route et charger l'événement
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isLoading.set(true);
        this.isRegistering.set(false);
        this.isCancelling.set(false);
        this.loadEvent(id);
      }
    });
  }

  loadEvent(id: string) {
    this.eventsService.getEventById(id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.isLoading.set(false);
        // Vérifier le statut d'inscription après le chargement de l'événement
        this.checkIfUserIsRegistered(id);
      },
      error: (err) => {
        this.isLoading.set(false);
      }
    });
  }

  constructor() { }

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

  // Suppression de onRegister redondant

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

    // Vérifier si déjà inscrit
    if (this.isUserRegistered()) {
      this.toastr.info('Vous êtes déjà inscrit à cet événement.', 'Information');
      return;
    }

    const event = this.event();
    if (!event) return;

    // Empêcher les doubles clics
    if (this.isRegistering()) return;

    this.isRegistering.set(true);

    this.registrationsService.register(event.id).subscribe({
      next: (response) => {
        this.isRegistering.set(false);
        if (event.currentRegistrations >= event.capacity) {
          this.toastr.info('Vous avez été ajouté à la liste d\'attente ! Vous serez notifié si une place se libère.', 'Liste d\'attente');
        } else {
          this.toastr.success('Inscription réussie ! Vous êtes désormais inscrit à l\'événement.', 'Succès');
        }
        // Mettre à jour l'état avec l'ID de l'inscription retourné par le serveur
        this.isUserRegistered.set(true);
        if (response && response.id) {
          this.currentRegistrationId.set(response.id);
        }
        this.fetchEventData();
        // Vérifier à nouveau le statut d'inscription pour être sûr
        this.checkIfUserIsRegistered(event.id);
      },
      error: (error) => {
        this.isRegistering.set(false);
        console.error('Erreur lors de l\'inscription:', error);
        if (error.status === 409) {
          this.toastr.info('Vous êtes déjà inscrit à cet événement.', 'Information');
          // Rafraîchir le statut d'inscription
          this.checkIfUserIsRegistered(event.id);
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
    this.showCancelConfirmDialog.set(true);
  }

  confirmCancelRegistration() {
    const event = this.event();
    const registrationId = this.currentRegistrationId();
    
    if (!event || !registrationId) return;

    this.showCancelConfirmDialog.set(false);
    this.isCancelling.set(true);

    this.registrationsService.cancel(registrationId).subscribe({
      next: () => {
        this.isCancelling.set(false);
        this.toastr.success('Votre inscription a été annulée avec succès.', 'Annulation réussie');
        this.isUserRegistered.set(false);
        this.currentRegistrationId.set(null);
        this.fetchEventData();
      },
      error: (error) => {
        this.isCancelling.set(false);
        this.toastr.error('Une erreur est survenue lors de l\'annulation de votre inscription', 'Erreur');
      }
    });
  }

  closeCancelConfirmDialog() {
    this.showCancelConfirmDialog.set(false);
  }

  checkIfUserIsRegistered(eventId: string) {
    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.role !== 'student') {
      this.isUserRegistered.set(false);
      this.currentRegistrationId.set(null);
      return;
    }

    this.registrationsService.getMyRegistrations().subscribe({
      next: (registrations) => {
        const registration = registrations.find(reg => reg.event.id === eventId);
        if (registration) {
          this.isUserRegistered.set(true);
          this.currentRegistrationId.set(registration.id);
        } else {
          this.isUserRegistered.set(false);
          this.currentRegistrationId.set(null);
        }
      },
      error: (err) => {
        this.isUserRegistered.set(false);
        this.currentRegistrationId.set(null);
      }
    });
  }
}
